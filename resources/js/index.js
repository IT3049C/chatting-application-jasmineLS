const nameInput = document.getElementById("my-name-input");
const myMessage = document.getElementById("my-message-input");
const sendButton = document.getElementById("send-button");
const chatBox = document.getElementById("chat");

const serverURL = `https://it3049c-chat.fly.dev/messages`;

async function fetchMessages() {
  try {
    const response = await fetch(serverURL);
    if (!response.ok) {
      throw new Error('Failed to fetch messages');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
}

function formatMessage(message, myNameInput) {
  const time = new Date(message.timestamp);
  const formattedTime = `${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}`;

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

async function updateMessages() {
  const messages = await fetchMessages();
  let formattedMessages = '';
  messages.forEach(message => {
    formattedMessages += formatMessage(message, nameInput.value);
  });
  chatBox.innerHTML = formattedMessages;
}

async function sendMessages(username, text) {
  const newMessage = {
    sender: username,
    text: text,
    timestamp: new Date().toISOString()
  };

  const response = await fetch(serverURL, {
    method: "POST",
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(newMessage)
  });

  if (response.status === 201) {
    // Immediately add the message to the chat
    chatBox.innerHTML += formatMessage(newMessage, username);
  }

  return response;
}

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

// Initially load the messages
updateMessages();

// Update messages every 10 seconds
const MILLISECONDS_IN_TEN_SECONDS = 10000;
setInterval(updateMessages, MILLISECONDS_IN_TEN_SECONDS);