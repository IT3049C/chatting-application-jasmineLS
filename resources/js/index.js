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
    return await response.json(); 
  } catch (error) {
    console.error('Error fetching messages:', error);
    return []; 
  }
}

function formatMessage(message, username) {
  const time = new Date(message.timestamp);
  const formattedTime = `${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}`;

  if (username === message.sender) {
    return `
      <div class="mine messages">
        <div class="message">${message.text}</div>
        <div class="sender-info">${formattedTime}</div>
      </div>
    `;
  } else {
    return `
      <div class="yours messages">
        <div class="message">${message.text}</div>
        <div class="sender-info">${message.sender} ${formattedTime}</div>
      </div>
    `;
  }
}

async function updateMessages() {
  const messages = await fetchMessages();
  const formattedMessages = messages.map(message => formatMessage(message, nameInput.value)).join('');
  chatBox.innerHTML = formattedMessages;


  chatBox.scrollTop = chatBox.scrollHeight;
}

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

    if (response.ok) {
      const formattedMessage = formatMessage(newMessage, username);
      chatBox.innerHTML += formattedMessage; 
      chatBox.scrollTop = chatBox.scrollHeight; 
    } else {
      console.error('Failed to send message');
    }

    return response;
  } catch (error) {
    console.error('Error sending message:', error);
    alert('Error sending message. Please check your connection.');
  }
}

function handleSendMessage() {
  const sender = nameInput.value;
  const message = myMessage.value.trim();

  if (sender && message) {
    sendMessages(sender, message)
      .then(() => {
        myMessage.value = ''; 
      })
      .catch((error) => {
        console.error('Error while sending message:', error);
      });
  } else {
    alert('Please enter both a name and a message.');
  }
}

sendButton.addEventListener("click", (event) => {
  event.preventDefault();
  handleSendMessage(); 
});

myMessage.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    handleSendMessage(); 
  }
});


updateMessages();

const MILLISECONDS_IN_TEN_SECONDS = 10000;
setInterval(updateMessages, MILLISECONDS_IN_TEN_SECONDS);

