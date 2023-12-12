import os
# import re
import tempfile
# import uuid
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
# from pydub import AudioSegment
# import torchaudio
import whisper
from deep_translator import GoogleTranslator
# from speechbrain.pretrained import HIFIGAN, Tacotron2


# Load TTS model
# tacotron2 = Tacotron2.from_hparams(source="speechbrain/tts-tacotron2-ljspeech", savedir="tmpdir_tts")
# hifi_gan = HIFIGAN.from_hparams(source="speechbrain/tts-hifigan-ljspeech", savedir="tmpdir_vocoder")

# constants
speech_tts_prefix = "speech-tts-"
wav_suffix = ".wav"
opus_suffix = ".opus"

# Load the transcription model
model = whisper.load_model("small")

# Clean temporary files (called every 5 minutes)
def clean_tmp():
    tmp_dir = tempfile.gettempdir()
    for file in os.listdir(tmp_dir):
        if file.startswith(speech_tts_prefix):
            os.remove(os.path.join(tmp_dir, file))
    print("[Speech REST API] Temporary files cleaned!")

# Preprocess text to replace numerals with words
# def preprocess_text(text):
#     text = re.sub(r'\d+', lambda m: num2words(int(m.group(0))), text)
#     return text

# # Run TTS and save file
# # Returns the path to the file
# def run_tts_and_save_file(text):
#     # Running the TTS
#     mel_outputs, mel_length, alignment = tacotron2.encode_batch([text])

#     # Running Vocoder (spectrogram-to-waveform)
#     waveforms = hifi_gan.decode_batch(mel_outputs)

#     # Get temporary directory
#     tmp_dir = tempfile.gettempdir()

#     # Save wav to temporary file
#     tmp_path_wav = os.path.join(tmp_dir, speech_tts_prefix + str(uuid.uuid4()) + wav_suffix)
#     torchaudio.save(tmp_path_wav, waveforms.squeeze(1), 22050)
#     return tmp_path_wav


@csrf_exempt
@require_POST
def process_audio(request):
    """
    Endpoint for processing audio files, performing transcription, and optionally translation.

    Args:
        request (HttpRequest): The HTTP request object. Containing the audio binary and parametrs 
        such as translation(boolean) and language(string)

    Returns:
        JsonResponse: JSON response containing the transcription and optional translation.
    """
    try:
        audio_file = request.FILES["audio"]
        language = request.POST.get("language", '').lower()
        is_translate_request = request.POST.get("translate", '').lower() == "true"
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
                    translation = GoogleTranslator(source='auto', target=language).translate(transcription["text"])
                    transcription = {'transcription': transcription, 'translation': translation}
                result = transcription

            else:
                transcription = model.transcribe(audio_file, fp16=False)
                result = {'transcription': transcription}

            return JsonResponse(result)

        finally:
            # Clean up: Remove the locally saved audio file
            os.remove(local_audio_path)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
