from flask import Flask, render_template, request, jsonify
import requests
import os
from dotenv import load_dotenv
import azure.cognitiveservices.speech as speechsdk

# Load environment variables
load_dotenv()

app = Flask(__name__)

# ---------------- HOME ROUTE ---------------- #
@app.route("/")
def home():
    return render_template("index.html")


# ---------------- AZURE CONFIG ---------------- #
translator_key = os.getenv("AZURE_TRANSLATOR_KEY")
translator_region = os.getenv("AZURE_TRANSLATOR_REGION")

speech_key = os.getenv("AZURE_SPEECH_KEY")
speech_region = os.getenv("AZURE_SPEECH_REGION")

print("Translator Key:", translator_key)
print("Translator Region:", translator_region)
print("Speech Key:", speech_key)
print("Speech Region:", speech_region)


# ---------------- TRANSLATION ---------------- #
@app.route("/translate", methods=["POST"])
def translate():
    try:
        data = request.get_json()
        text = data["text"]
        target_lang = data["target"]

        endpoint = "https://api.cognitive.microsofttranslator.com/translate"

        params = {
            "api-version": "3.0",
            "to": target_lang
        }

        headers = {
            "Ocp-Apim-Subscription-Key": translator_key,
            "Ocp-Apim-Subscription-Region": translator_region,
            "Content-Type": "application/json"
        }

        body = [{"text": text}]

        response = requests.post(endpoint, params=params, headers=headers, json=body)
        result = response.json()

        print("Azure Response:", result)

        # If Azure returns error
        if "error" in result:
            return jsonify({"error": result["error"]["message"]})

        translated_text = result[0]["translations"][0]["text"]

        return jsonify({"translated_text": translated_text})

    except Exception as e:
        print("Translation Error:", e)
        return jsonify({"error": "Translation Failed"})


# ---------------- TEXT TO SPEECH ---------------- #
@app.route("/speak", methods=["POST"])
def speak():
    try:
        data = request.get_json()
        text = data["text"]

        speech_config = speechsdk.SpeechConfig(
            subscription=speech_key,
            region=speech_region
        )

        speech_config.speech_synthesis_voice_name = "en-US-AriaNeural"

        synthesizer = speechsdk.SpeechSynthesizer(
            speech_config=speech_config
        )

        synthesizer.speak_text_async(text)

        return jsonify({"message": "Speaking..."})

    except Exception as e:
        print("Speech Error:", e)
        return jsonify({"error": "Speech Failed"})


# ---------------- RUN APP ---------------- #
if __name__ == "__main__":
    app.run(debug=True)