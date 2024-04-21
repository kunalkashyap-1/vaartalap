import os
import tempfile
from flask import Flask, request, jsonify
from deep_translator import GoogleTranslator
import whisper
from flask_caching import Cache
from gevent.pywsgi import WSGIServer
from flask_cors import CORS
from sign_recorder import SignModel,SignRecorder
from utils.dataset_utils import load_dataset,load_reference_signs
from utils.landmark_utils import save_array, extract_landmarks_from_video

app = Flask(__name__)
CORS(app)

# Configure cache
cache = Cache(app, config={'CACHE_TYPE': 'simple'})

# constants
speech_tts_prefix = "speech-tts-"
wav_suffix = ".wav"
opus_suffix = ".opus"

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
    video_path = os.path.join(tempfile.gettempdir(), 'recorded_video.webm')
    video_file.save(video_path)
    return video_path

# Utility function to process sign language using the AI model
def process_sign(landmarks):
    sign = sign_recorder.process_vid(landmarks)
    return sign

@app.route('/process_video', methods=['POST'])
def process_video():
    # print(request.files['video'])
    # return jsonify({'sign': "got them vids."})

    try:
        if 'video' not in request.files:
            return jsonify({'error': 'No video file provided'}), 400

        video_file = request.files['video']
        
        # Save the video file locally
        video_path = save_video_locally(video_file)
        
        # Extract landmarks from the video
        landmarks = extract_landmarks_from_video(video_path)
        
        # Process the sign language gesture
        sign = process_sign(landmarks)
        
        # Remove the video file after processing
        os.remove(video_path)
        
        return jsonify({'sign': sign})

    except Exception as e:
        error_message = f"An error occurred: {str(e)}"
        print(e)
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
