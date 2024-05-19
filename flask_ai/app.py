import os
import tempfile
from flask import Flask, request, jsonify
from deep_translator import GoogleTranslator
import whisper
import subprocess
from flask_caching import Cache
from gevent.pywsgi import WSGIServer
from flask_cors import CORS
from sign_recorder import SignRecorder
from utils.dataset_utils import load_dataset,load_reference_signs
import cv2
import mediapipe as mp
from utils.mediapipe_utils import mediapipe_detection
# from utils.landmark_utils import save_array, extract_landmarks


app = Flask(__name__)
CORS(app)

# Configure cache
cache = Cache(app, config={'CACHE_TYPE': 'simple'})

# constants
speech_tts_prefix = "speech-tts-"
wav_suffix = ".wav"
opus_suffix = ".opus"

# FFmpeg path
FFMPEG_PATH = '/usr/bin/ffmpeg'

# Load the transcription model
model = whisper.load_model("base")
# Load reference signs
videos = load_dataset()
reference_signs = load_reference_signs(videos)
sign_recorder = SignRecorder(reference_signs)

# Clean temporary files (called every 5 minutes)
def clean_tmp():
    tmp_dir = tempfile.gettempdir()
    for file in os.listdir(tmp_dir):
        if file.startswith(speech_tts_prefix):
            os.remove(os.path.join(tmp_dir, file))
    print("[Speech REST API] Temporary files cleaned!")

# Utility function to save video locally
def save_video_locally(video_file):
    with tempfile.NamedTemporaryFile(delete=False) as temp_file:
            temp_file.write(video_file.read())
            local_video_path = temp_file.name
            return local_video_path

# Function to transcode WebM to MP4 using FFmpeg
def transcode_webm_to_mp4(input_file):
    with tempfile.NamedTemporaryFile(suffix='.mp4', delete=False) as temp_file:
        mp4_path = temp_file.name
        command = [FFMPEG_PATH, '-i', input_file, mp4_path]
        subprocess.run(command, stderr=subprocess.STDOUT)
    # Get absolute path
    absolute_path = os.path.abspath(mp4_path)
    return absolute_path


# Utility function to process sign language using the AI model
def process_sign(landmarks):
    sign = sign_recorder.process_vid(landmarks)
    return sign


#functions for the purpose of testing start
def convert_webm_to_mp4(input_file, output_file):
    ffmpeg_command = ['ffmpeg', '-i', input_file, '-c:v', 'libx264', '-crf', '20', '-preset', 'medium', output_file]
    subprocess.run(ffmpeg_command)


def play_video(video_file):
    cap = cv2.VideoCapture(video_file)
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
        cv2.imshow('Video', frame)
        if cv2.waitKey(25) & 0xFF == ord('q'):
            break
    cap.release()
    cv2.destroyAllWindows()

input_file = 'input.webm'
output_file = 'output.mp4'
# end
import time

@app.route('/process_video', methods=['POST'])
def process_video():
    try:
        if 'video' not in request.files:
            return jsonify({'error': 'No video file provided'}), 400

        video_file = request.files['video']
        
        # Save the video file locally
        video_path = save_video_locally(video_file)
        print(video_path)

        # Transcode WebM to MP4
        output_file = transcode_webm_to_mp4(video_path)
        print("Transcoding completed:", output_file)

        # Wait for the transcoding process to complete
        while not os.path.exists(output_file):
            print("not exists")
            time.sleep(0.1)

        print("exists")
        play_video(output_file)
        # Open the MP4 video file for processing
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            print("Error: Unable to open the camera.")
            exit()

        # Set up the Mediapipe environment
        with mp.solutions.holistic.Holistic(
            min_detection_confidence=0.5, min_tracking_confidence=0.5
        ) as holistic:
            while cap.isOpened():
                # Read feed
                ret, frame = cap.read()
                if not ret:
                    break

                # Make detections
                image, results = mediapipe_detection(frame, holistic)

                # Process results
                sign_detected, is_recording = sign_recorder.process_results(results)
                if len(sign_detected) > 0:
                    print(sign_detected)

                sign_recorder.record()

        cap.release()
        cv2.destroyAllWindows()

        # Clean up: Remove the temporary video files after processing
        os.remove(video_path)
        os.remove(output_file)
        
        return jsonify({'sign': "Sign detection completed successfully"})

    except Exception as e:
        error_message = f"An error occurred: {str(e)}"
        print(error_message)
        return jsonify({'error': error_message}), 500


# Asynchronous processing using Gevent
@app.route('/process_audio', methods=['POST'])
def process_audio():
    try:
        if 'audio' not in request.files:
            return jsonify({'error': 'No audio file provided'}), 400

        audio_file = request.files['audio']
        language = request.form.get('language', '').lower()
        is_translate_request = request.form.get('translate', '').lower() == "true"
        task = "translate"

        # Save the audio file locally
        with tempfile.NamedTemporaryFile(delete=False) as temp_file:
            temp_file.write(audio_file.read())
            local_audio_path = temp_file.name

        try:
            # Load the locally saved audio file
            audio_file = whisper.load_audio(local_audio_path)
            audio_file = whisper.pad_or_trim(audio_file)

            if is_translate_request:
                transcription = model.transcribe(audio_file, fp16=False)
                if language == "en":
                    # If the language is English, use the default transcribe method
                    transcription = model.transcribe(audio_file, fp16=False, task=task)
                else:
                    # If the language is not English, use GoogleTranslator
                    translation = translate_text(transcription["text"], 'auto', language)
                    transcription = {'transcription': transcription, 'translation': translation}
                result = transcription
            else:
                transcription = model.transcribe(audio_file, fp16=False)
                result = {'transcription': transcription}

            return jsonify(result)

        finally:
            # Clean up: Remove the locally saved audio file
            os.remove(local_audio_path)

    except Exception as e:
        error_message = f"An error occurred: {str(e)}"
        print(error_message)
        return jsonify({'error': error_message}), 500

# Caching the translation results
@cache.memoize(timeout=300)  # Cache translation for 5 minutes
def translate_text(text, source_language, target_language):
    translation = GoogleTranslator(source=source_language, target=target_language).translate(text)
    return translation

@app.route('/translate_text', methods=['POST'])
def translate_text_route():
    try:
        data = request.json
        text = data.get('text', '')
        source_language = data.get('source_language', 'auto')
        target_language = data.get('target_language', 'en')
        
        translation = translate_text(text, source_language, target_language)
        
        return jsonify({'translation': translation})
    
    except Exception as e:
        error_message = f"An error occurred: {str(e)}"
        print(error_message)
        return jsonify({'error': error_message}), 500

if __name__ == '__main__':
    port = 8000  
    http_server = WSGIServer(('0.0.0.0', port), app)
    print(f"Flask API is running and listening on port {port}")
    http_server.serve_forever()
