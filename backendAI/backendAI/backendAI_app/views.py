from django.shortcuts import render
import magic
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from io import BytesIO
import whisper
from deep_translator import GoogleTranslator

# Create your views here.

@csrf_exempt
@require_POST
def process_audio(request):
    print(request.FILES)
    try:
        audio_file = request.FILES["audio"]
        # Determine the type of request based on the presence of the 'translate' parameter
        is_translate_request = request.POST.get("translate", '').lower() == 'true'

        model = whisper.load_model("base")
        # Read the content of the uploaded audio file
        audio_content = audio_file.read()

        # Load the audio content using BytesIO
        print(audio_content)
        audio_file = whisper.load_audio(audio_content)
        audio_file = whisper.pad_or_trim(audio_file)
        
        if is_translate_request:
            transcription = model.transcribe(audio_file, fp16=False)
            translation = GoogleTranslator(source='auto', target='en').translate(transcription["text"])
            result = {'transcription': transcription, 'translation': translation}
        else:
            transcription =  transcription = model.transcribe(audio_file) # Using Whisper for transcription
            result = {'transcription': transcription}

        return JsonResponse(result)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)