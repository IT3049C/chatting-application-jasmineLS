// DOM Elements
const nameInput = document.getElementById("my-name-input");
const myMessage = document.getElementById("my-message-input");
const sendButton = document.getElementById("send-button");
const chatBox = document.getElementById("chat");

const serverURL = `https://it3049c-chat.fly.dev/messages`;

// Format the message
function formatMessage(message, myNameInput) {
  const time = new Date(message.timestamp);
  const formattedTime = `${time.getHours()}:${time.getMinutes()}`;

  if (myNameInput === message.sender) {
    return `
      <div class="mine messages">
        <div class="message">
          ${message.text}
        </div>
        <div class="sender-info">
          ${formattedTime}
        </div>
      </div>
    `;
  } else {
    return `
      <div class="yours messages">
        <div class="message">
          ${message.text}
        </div>
        <div class="sender-info">
          ${message.sender} ${formattedTime}
        </div>
      </div>
    `;
  }
}

// Fetch messages from server
async function fetchMessages() {
  try {
    const response = await fetch(serverURL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const messages = await response.json();
    return messages;
  } catch (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
}

// Update messages in chat box
async function updateMessages() {
  try {
    const messages = await fetchMessages();
    let formattedMessages = "";
    messages.forEach(message => {
      formattedMessages += formatMessage(message, nameInput.value);
    });
    chatBox.innerHTML = formattedMessages;
  } catch (error) {
    console.error('Error updating messages:', error);
  }
}

// Send message function
async function sendMessages(username, text) {
  const newMessage = {
    sender: username,
    text: text,
    timestamp: new Date().toISOString()
  };

  try {
    const response = await fetch(serverURL, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newMessage)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Immediately update UI with the new message
    const currentMessages = await fetchMessages();
    let formattedMessages = "";
    currentMessages.forEach(message => {
      formattedMessages += formatMessage(message, nameInput.value);
    });
    chatBox.innerHTML = formattedMessages;

    return response;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
}

// Event listener for send button
sendButton.addEventListener("click", async function(event) {
  event.preventDefault();
  const sender = nameInput.value;
  const message = myMessage.value;
  if (sender.trim() && message.trim()) {
    try {
      await sendMessages(sender, message);
      myMessage.value = "";
    } catch (error) {
      console.error('Error in click handler:', error);
    }
  }
});

// Handle Enter key in message input
myMessage.addEventListener("keypress", async function(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    const sender = nameInput.value;
    const message = myMessage.value;
    if (sender.trim() && message.trim()) {
      try {
        await sendMessages(sender, message);
        myMessage.value = "";
      } catch (error) {
        console.error('Error in keypress handler:', error);
      }
    }
  }
});

// Initial load of messages
updateMessages();

// Update messages every 10 seconds
const MILLISECONDS_IN_TEN_SECONDS = 10000;
setInterval(updateMessages, MILLISECONDS_IN_TEN_SECONDS);