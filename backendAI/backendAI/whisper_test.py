#deep_translator test 
from deep_translator import GoogleTranslator
trans = GoogleTranslator(source='auto', target='de').translate("keep it up, you are awesome") 
print(trans)
