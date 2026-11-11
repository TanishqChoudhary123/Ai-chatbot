const API_KEY = "you can put you api key here brooother";

const MODEL = "gemini-3.6-flash";

const sendButton = document.getElementById("sendBtn");
const messageInput = document.getElementById("userInput");
const chatBox = document.getElementById("chatBox");

let chatHistory = [];

function addMessage(message, messageType) {
    const newMessage = document.createElement("div");

    newMessage.className = messageType;
    newMessage.textContent = message;

    chatBox.appendChild(newMessage);
    chatBox.scrollTop = chatBox.scrollHeight;

    return newMessage;
}

async function sendMessage() {
    const message = messageInput.value.trim();

    if (message === "") {
        return;
    }

    if (API_KEY === "YOUR_GEMINI_API_KEY") {
        alert("Please enter your Gemini API key!");
        return;
    }

    addMessage(message, "user-message");
    messageInput.value = "";
    sendButton.disabled = true;

    const botMessage = addMessage("Thinking...", "bot-message");

    chatHistory.push({
        role: "user",
        parts: [{ text: message }]
    });

    try {
        const response = await fetch(
            "https://generativelanguage.googleapis.com/v1beta/models/" + MODEL + ":generateContent",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-goog-api-key": API_KEY
                },
                body: JSON.stringify({
                    contents: chatHistory
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            let errorMessage = "API request failed.";

            if (data.error && data.error.message) {
                errorMessage = data.error.message;
            }

            throw new Error(errorMessage);
        }

        let reply = "";

        if (
            data.candidates &&
            data.candidates.length > 0 &&
            data.candidates[0].content &&
            data.candidates[0].content.parts
        ) {
            const replyParts = data.candidates[0].content.parts;

            for (let i = 0; i < replyParts.length; i++) {
                if (replyParts[i].text) {
                    reply = reply + replyParts[i].text;
                }
            }
        }

        if (reply === "") {
            reply = "No response received.";
        }

        botMessage.textContent = reply;

        chatHistory.push({
            role: "model",
            parts: [{ text: reply }]
        });
    } catch (error) {
        botMessage.textContent = "Error: " + error.message;
        chatHistory.pop();
    }

    sendButton.disabled = false;
    messageInput.focus();
}

sendButton.addEventListener("click", sendMessage);

messageInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        sendMessage();
    }
});