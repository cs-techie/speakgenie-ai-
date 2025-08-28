from gtts import gTTS
import os

# Path inside your current project
out_path = r"C:\Users\Administrator\Desktop\speakgenie\media\stt\test.mp3"

text = "Hello! My name is Sam. How are you today?"
gTTS(text).save(out_path)
print("Saved:", out_path)
