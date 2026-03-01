// =======================
// TRANSLATE FUNCTION
// =======================
function translateText() {

    let text = document.getElementById("inputText").value.trim();
    let targetLang = document.getElementById("targetLang").value;
    let status = document.getElementById("status");
    let loader = document.getElementById("loader");

    if (text === "") {
        alert("Please enter some text first.");
        return;
    }

    status.innerText = "🌍 Translating...";
    loader.style.display = "block";

    fetch("/translate", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            text: text,
            target: targetLang
        })
    })
    .then(response => response.json())
    .then(data => {

        loader.style.display = "none";   // HIDE LOADER

        if (data.translated_text) {
            document.getElementById("output").innerText = data.translated_text;
            status.innerText = "✅ Translated successfully";
        } 
        else if (data.error) {
            document.getElementById("output").innerText = data.error;
            status.innerText = "❌ Translation failed";
        } 
        else {
            status.innerText = "❌ Unexpected error";
        }
    })
    .catch(error => {
        loader.style.display = "none";   // HIDE LOADER
        console.error("Fetch Error:", error);
        status.innerText = "❌ Server error occurred";
    });
}


// =======================
// TEXT TO SPEECH
// =======================
function speakText() {

    let text = document.getElementById("output").innerText.trim();
    let status = document.getElementById("status");

    if (text === "") {
        alert("No translated text to speak.");
        return;
    }

    status.innerText = "🔊 Speaking...";

    fetch("/speak", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            text: text
        })
    })
    .then(response => response.json())
    .then(data => {
        status.innerText = "✅ Speech played";
    })
    .catch(error => {
        console.error("Speech Error:", error);
        status.innerText = "❌ Speech failed";
    });
}


// =======================
// SPEECH TO TEXT
// =======================
function startListening() {

    let status = document.getElementById("status");
    let micBtn = document.getElementById("micBtn");

    if (!('webkitSpeechRecognition' in window)) {
        alert("Speech recognition not supported in this browser. Use Chrome.");
        return;
    }

    const recognition = new webkitSpeechRecognition();
    recognition.lang = "en-US";

    recognition.onstart = function() {
        status.innerText = "🎤 Listening...";
        micBtn.classList.add("listening");  // Glow effect
    };

    recognition.onresult = function(event) {
        let transcript = event.results[0][0].transcript;
        document.getElementById("inputText").value = transcript;
        status.innerText = "✅ Speech captured";
    };

    recognition.onerror = function(event) {
        status.innerText = "❌ Speech recognition error";
        console.error(event.error);
    };

    recognition.onend = function() {
        micBtn.classList.remove("listening");  // Stop glow
    };

    recognition.start();
}