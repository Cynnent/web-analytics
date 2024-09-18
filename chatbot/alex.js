// variables and constants
const wsURL = "https://web-analytics.onrender.com/";
const clientName = "Appland";
const getBotDataURL = "https://web-analytics.onrender.com/chatBot/getBotData";
const getGreetingData = {
  clientName: clientName,
  inputs: ["hi"],
};
let initialGreetingMessage = "Hello there! How can I help you today?";
let socket;
let isChatVisible = false;
let greetingMessageSent = false;
let greetingMessageFlag = false;
let shouldAnimate = true;
let isAvatar = false;
let chatBotAnimation = "";
let apiBotReply = "";

function loadChatHistory() {
  const chatHistory = JSON.parse(sessionStorage.getItem("chatHistory")) || [];
  const chatDisplay = document.getElementById("chatDisplay");
  chatHistory.forEach((message) => {
    chatDisplay.innerHTML += message;
  });
  if (chatHistory.length > 0) {
    scrollToBottom();
  }

  greetingMessageFlag =
    sessionStorage.getItem("greetingMessageFlag") === "true";
}

function injectChatbot() {
  if (isAvatar) {
    return;
  }
  const alexAvatarPic = `
   <div id="ballWrapper" onclick="toggleChat()">
  <div id="ball">
    <img src="./avatar.png" alt="Character" id="characterMask" />
  </div>
  <div id="ballShadow"></div>
</div>
  `;
  injectHTML(alexAvatarPic);
  isAvatar = true;
  const chatBox = document.getElementById("chatbox");
  const sendButton = document.getElementById("sendBtn");
  if (chatBox) {
    chatBox.addEventListener("keypress", (event) => {
      if (event.key === "Enter") sendMessage();
    });
  }

  if (sendButton) sendButton.addEventListener("click", sendMessage);
  loadChatHistory();
}

// get animations
fetch(
  `https://web-analytics.onrender.com/chatBot/getSubmittedAnimation/${clientName}`
)
  .then((response) => {
    if (!response.ok) {
      throw new Error("Animation response not okay." + response.statusText);
    }
    return response.json();
  })
  .then((data) => {
    chatBotAnimation = data[0]["animation"].toLowerCase();
    injectChatbot(chatBotAnimation);
  })
  .catch((error) => {
    console.error("There was a problem with the fetch request.", error);
    setTimeout(connectWebSocket, 1000);
  });

// initializing websocket
function initializeWebSocket() {
  socket = new WebSocket(wsURL);

  socket.onopen = () => {};

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    handleIncomingMessage(data);
  };

  socket.onclose = () => {
    setTimeout(initializeWebSocket, 1000);
  };

  socket.onerror = (error) => {
    console.error("WebSocket error: ", error);
  };
}

function getGreetingMessage() {
  const sendData = {
    clientName: clientName,
    inputs: ["hi"],
  };

  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(sendData));
  } else {
    console.error("WebSocket connection is not open");
  }
}

const scrollToBottom = () => {
  const chatContainer = document.getElementById("chatDisplay");

  chatContainer.lastElementChild.scrollIntoView({
    alignToTop: false,
    behavior: "smooth",
    block: "end",
  });
};

function saveChatHistory(message) {
  let chatHistory = JSON.parse(sessionStorage.getItem("chatHistory")) || [];
  chatHistory.push(message);
  sessionStorage.setItem("chatHistory", JSON.stringify(chatHistory));
}

// Function to handle incoming WebSocket messages
function handleIncomingMessage(data) {
  const chatContainer = document.getElementById("chatDisplay");
  removeTypingAnimationOnly();

  let messageTemplate = "";

  if (data.questions) {
    messageTemplate = `
      <li style="${chatBotListStyle}">
        <img src="./alex-pic.svg" style="${chatBotChatAvatarStyle}" />
        <p style="${chatBotBubbleStyle}">
          ${data.questions[0]["question"]}
        </p>
      </li>
    `;
    chatContainer.innerHTML += messageTemplate;
    scrollToBottom();
  } else if (data.offers) {
    const offers = data["offers"];
    messageTemplate = `
      <li style="${chatBotListStyle}">
        <img src="./alex-pic.svg" style="${chatBotChatAvatarStyle}" />
        <div style='display: flex; flex-direction: column;'>
          <p style="${chatBotBubbleStyle}">
            Here are some offers.
          </p>
    `;
    offers.forEach((element) => {
      if (element.link) {
        messageTemplate += `<a href="${element.link}" target='_blank' style="${anchorStyle}">`;
      }
      messageTemplate += `<button style="${buttonStyle}">${element.offer}</button>`;
      if (element.link) {
        messageTemplate += `</a>`;
      }
    });
    messageTemplate += `</div></li>`;
    chatContainer.innerHTML += messageTemplate;
    scrollToBottom();
  } else if (data.message) {
    messageTemplate = `
      <li style="${chatBotListStyle}">
        <img src="./alex-pic.svg" style="${chatBotChatAvatarStyle}" />
        <div style='display: flex; flex-direction: column;'>
          <p style="${chatBotBubbleStyle}">
            Sorry. I didn't quite get that. Here are some options for you
          </p>
          <button style="${buttonStyle}">FAQs</button>
          <button style="${buttonStyle}">Track my order</button>
          <button style="${buttonStyle}">Customer Support</button>
          <button style="${buttonStyle}">Reset Password</button>
        </div>
      </li>
    `;
    chatContainer.innerHTML += messageTemplate;
    scrollToBottom();
  }

  saveChatHistory(messageTemplate);
}

initializeWebSocket();

// styles for templates

const style = document.createElement("style");
style.textContent = `
  #characterMask {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 70px;
  }

  #ballWrapper {
    width: 60px;
    height: 140px;
    position: fixed;
    right: 60px;
    bottom: 20px;
    z-index: 100;
    cursor: pointer;
    animation: grow 5s linear forwards;
  }

  #ballWrapper:active {
    transform: scale(0);
    cursor: pointer;
  }

  #ball {
    width: 60px;
    height: 60px;
    border-radius: 25px;
    background: #bbb;
    background: -moz-linear-gradient(
      top,
      rgb(187, 187, 187) 0%,
      rgb(119, 119, 119) 99%
    );
    background: -webkit-linear-gradient(
      top,
      rgb(187, 187, 187) 0%,
      rgb(119, 119, 119) 99%
    );
    background: linear-gradient(
      top,
      rgb(187, 187, 187) 0%,
      rgb(119, 119, 119) 99%
    );
    box-shadow: inset 0 -5px 15px rgba(255, 255, 255, 0.4),
      inset -2px -1px 40px rgba(0, 0, 0, 0.4), 0 0 1px #000;
    position: absolute;
    top: 0;
    z-index: 11;
    animation: jump 1s infinite;
    cursor: pointer;
  }

  @keyframes grow {
    0% {
      transform: scale(0.1);
    }
    100% {
      transform: scale(1);
    }
  }

  #ballShadow {
    position: absolute;
    left: 50%;
    bottom: 0;
    z-index: 10;
    margin-left: -10px;
    width: 20px;
    height: 30px;
    background: rgba(20, 20, 20, 0.1);
    box-shadow: 0 0 20px 35px rgba(20, 20, 20, 0.1);
    border-radius: 10px / 15px;
    transform: scaleY(0.3);
    animation: shrink 1s infinite;
  }

  @keyframes jump {
    0%,
    100% {
      top: 0;
      animation-timing-function: ease-in;
    }
    50% {
      top: 60px;
      height: 60px;
      animation-timing-function: ease-out;
    }
    55% {
      top: 70px;
      height: 50px;
      border-radius: 30px / 25px;
      animation-timing-function: ease-in;
    }
    65% {
      top: 50px;
      height: 70px;
      border-radius: 35px;
      animation-timing-function: ease-out;
    }
  }
`;

document.head.appendChild(style);

const chatBotBubbleStyle = `
  display: inline-block;
  padding: 1rem 1.25rem;
  background-color: #f4f4f4;
  border-radius: 1.625rem;
  color: #707070;
  font-size: 1rem;
  margin-top: 0.375rem;
  margin-bottom: 1.25rem;
  word-wrap: break-word;
  width: fit-content;
`;

const chatBotListStyle = `
  display: flex; 
  gap: 6.6px;
`;

const chatBotChatAvatarStyle = `
  width: 28px; 
  height: 28px;
`;

const typingDotStyle = `
  background-color: #8c92a5; 
  border-radius: 50%; 
  height: 7px; 
  margin-right: 2px; 
  vertical-align: middle; 
  width: 7px; 
  display: inline-block; 
  animation: mercuryTypingAnimation 1.8s infinite ease-in-out; 
  animation-delay: 200ms;
`;

const buttonStyle = `
  padding: 14px;
  border-radius: 40px;
  border: 1px solid #052288;
  background-color: #eef0f9;
  color: #052288;
  text-decoration: none;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  cursor: pointer;
  width: max-content;
`;

const anchorStyle = `
  text-decoration: none;
  max-width: fit-content;
`;

const userBubbleStyle = `
  padding: 1rem 1.25rem;
  background-color: #052288;
  max-width: fit-content;
  border-radius: 1.625rem;
  color: #EBEEF9;
  font-size: 1rem;
  margin-bottom: 1rem;
  margin-bottom: 1.25rem;
  max-width: calc(100% - 2rem);
  word-wrap: break-word;
`;

const chatBotAvatarStyle = `
  width: 100px; 
  height: 100px;
`;

// animation keyframes
const bounceKeyframes = `
@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-30px);
  }
  60% {
    transform: translateY(-15px);
  }
}`;

const slideInKeyframes = `
@keyframes slidein {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}`;

const pulseKeyframes = `
  @keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.5);
  }
  100% {
    transform: scale(1);
  }
}
`;

const rotateKeyframes = `
@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
`;

const mercuryKeyframes = `
  @keyframes mercuryTypingAnimation {
    0% {
      transform: translateY(0px);
      background-color: #8c92a5;
    }
    28% {
      transform: translateY(-7px);
      background-color: #caccd4;
    }
    44% {
      transform: translateY(0px);
      background-color: #e1e2e6;
    }
  }
`;

const fadeUpKeyframes = `
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}`;

const fadeInKeyframes = `
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}`;

// add the animations to doc stylesheet
const styleSheet = document.createElement("style");
styleSheet.innerText =
  bounceKeyframes +
  slideInKeyframes +
  pulseKeyframes +
  rotateKeyframes +
  mercuryKeyframes +
  fadeInKeyframes;

document.head.appendChild(styleSheet);

// HTML templates
let chatTemplate = `

<div
  id="chat"
  style="
    max-width: 400px;
    min-width: 400px;
    border-radius: 17px;
    position: fixed;
    bottom: 50px;
    right: 50px;
    background-color: #FFFFFF;
    display: none;
    transition: transform 0.4s ease, box-shadow 0.4s ease;
  "

  
  onmouseover="this.style.transform='skew(0.8deg)';"
  onmouseout="this.style.transform='none';"
>

<div style="position: absolute; left: 120px; top: -16px;">
    <img src="./left-hand.svg" alt="Left hand" style="height:1.3rem" />
  </div>

  <!-- Right hand -->
  <div style="position: absolute; right: 120px; top: -16px;">
    <img src="./right-hand.svg" alt="Right hand" style="height:1.3rem"/>
  </div>

  <div id="headContainer" style="position: absolute; top: 0px; left: 50%; transform: translateX(-50%); opacity: 1; z-index:-1; transition: top 3s ease-out, opacity 0.1s ease-out, transform 3s ease-out;">
    <img src="./avatar-head.svg" alt="Head image" style="width: 100px; height: auto;" />
  </div>

  <div
    class="header"
    style="
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 17px;
      background-color: #052288;
      border-radius: 17px 17px 0 0;
      box-shadow: 0px 3px 6px #00000029;
    "
  >
    <div style="display: flex; align-items: center">
      <img
        src="./alex-pic.svg"
        alt="Alex profile picture"
        style="width: 48.81px; height: 48.81px; margin-right: 12px"
      />
      <span style="color: #ebeef9">Alex</span>
    </div>

    <button
      style="background-color: transparent; border: none; cursor: pointer" onclick="toggleChat()" 
    >
      <img src="./cross-white.svg" alt="Close icon" />
    </button>
  </div>
  <div
    class="chat"
    id="innerChat"
    style="
      height: 100px;
      transition: height 0.5s;
      border-radius: 0 0 17px 17px;
      background-image: url('./chat-bg.svg');
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      z-index:1;
      background-color:#fff
    "
  >
    <div
      style="
        width: 100%;
        height: 100%;
        max-height: calc(100% - 90px);
        overflow-y: scroll;
        padding: 22px 10px 22px 10px;
        z-index:1;
      "
      class="chat-container"
    >
      <ul id="chatDisplay" style="list-style: none; width: 100%">
        <div
          style="
            display: flex;
            justify-content: space-between;
            margin-bottom: 24px;
          "
        >
          <span style="height: 1px; background-color: #8c92a4"></span>
          <p style="font-size: 14px; color: #8c92a4">Monday 25,March</p>
          <span style="height: 1px; background-color: #8c92a4"></span>
        </div>

       
      </ul>
    </div>

    <div
      style="
        width: 90%;
        position: absolute;
        bottom: 35px;
        display: flex;
        justify-content: center;
      "
    >
      <div style="position: relative; width: 100%">
        <input
          type="text"
          id="chatbox"
          name="chatbox"
          style="
            width: 100%;
            padding: 12px 90px 12px 24px;
            background-color: #f5f5f5;
            border: none;
            color: #8c92a4;
            border-radius: 30px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          "
          placeholder="Type your message..."
        />
        <div
          style="
            position: absolute;
            top: 7px;
            right: 16px;
            display: flex;
            gap: 1rem;
            margin-top: auto;
            margin-bottom: auto;
          "
        >
          <button
            style="background-color: transparent; border: none; cursor: pointer" id="sendBtn"
          >
            <img src="./paper-plane.svg" alt="send" />
          </button>
        </div>
      </div>
    </div>
    <div
      class="footer"
      style="
        display: flex;
        align-items: center;
        position: absolute;
        bottom: 0;
        justify-content: center;
      "
    >
      <span
        style="
          font-size: 14px;
          color: #797e8e;
          margin-right: 7px;
          vertical-align: baseline;
        "
        >Powered by</span
      >
      <img src="./cynnent-logo.svg" alt="cynnent logo" />
    </div>
  </div>
</div>
`;

const typingTemplate = `
<li class="typing" style="display: flex; gap: 6.6px;">
  <img src="./alex-pic.svg" style="${chatBotChatAvatarStyle}" />
  <div style="${chatBotBubbleStyle}">
    <div class="dot" style="${typingDotStyle}; animation-delay: 200ms"></div>
    <div class="dot" style="${typingDotStyle} animation-delay: 300ms"></div>
    <div class="dot" style="${typingDotStyle} animation-delay: 400ms"></div>
  </div>
</li>
`;

const initialMessageTemplate = `
  <li style="${chatBotListStyle}">
    <img src="./alex-pic.svg" style="${chatBotChatAvatarStyle}" />
    <p
      style="
      ${chatBotBubbleStyle}
      "
    >
      ${initialGreetingMessage}
    </p>
  </li>
`;

const dummyReply = `
        <li style="list-style: none;">
          <p
            style="
              padding: 19px;
              background-color: #f4f4f4;
              max-width: fit-content;
              border-radius: 22px;
              color: #707070;
              font-size: 17px;
              margin-bottom: 16px;
              max-width: calc(100% - 15px);
              word-wrap: break-word;
              display: inline-block;
            "
          >
            This is a dummy response.
          </p>
        </li>
`;

const apiReply = `
        <li style="list-style: none;">
          <p
            style="
              padding: 19px;
              background-color: #f4f4f4;
              max-width: fit-content;
              border-radius: 22px;
              color: #707070;
              font-size: 17px;
              margin-bottom: 16px;
              max-width: calc(100% - 15px);
              word-wrap: break-word;
              display: inline-block;
            "
          >
            This is a dummy response.
          </p>
        </li>
`;

const selfExplainTemplate = `
        <li style="list-style: none;">
          <p
            style="
              padding: 19px;
              background-color: #f4f4f4;
              max-width: fit-content;
              border-radius: 22px;
              color: #707070;
              font-size: 17px;
              margin-bottom: 16px;
              max-width: calc(100% - 15px);
              word-wrap: break-word;
              display: inline-block;
            "
          >
            Hi! I'm Alex. I was developed by Cynnent. It's nice to meet you ~
          </p>
        </li>
`;

const buttonsTemplate = `
        <li>
          <button
            style="
              padding: 14px;
              border-radius: 40px;
              border: 1px solid #052288;
              background-color: #eef0f9;
              color: #052288;
              margin-bottom: 10px;
              display: flex;
              align-items: center;
              cursor: pointer;
            "
          >
            <p style="margin-right: 10px; font-weight: 500">
              Bought by mistake
            </p>
            <img src="./info-blue.svg" alt="info" />
          </button>
        </li>
        <li>
          <button
            style="
              padding: 14px;
              border-radius: 40px;
              border: 1px solid #052288;
              background-color: #eef0f9;
              color: #052288;
              margin-bottom: 10px;
              display: flex;
              align-items: center;
              cursor: pointer;
            "
          >
            <p style="margin-right: 10px; font-weight: 500">
              Better price available
            </p>
            <img src="./badge-check-blue.svg" alt="info" />
          </button>
        </li>
`;

function injectHTML(alexAvatarPic) {
  const container = document.createElement("div");
  container.innerHTML = alexAvatarPic.trim();
  document.body.appendChild(container.firstChild);

  const secondContainer = document.createElement("div");
  secondContainer.innerHTML = chatTemplate.trim();
  document.body.appendChild(secondContainer.firstChild);

  const closeIcon = document.querySelector("#chat .header button");
  closeIcon.addEventListener("click", injectChatbot);
}

function animateHandsAndHead() {
  const rightHand = document.querySelector("[alt='Right hand']");
  const leftHand = document.querySelector("[alt='Left hand']");
  const headContainer = document.getElementById("headContainer");

  // Ensure initial state is hidden
  rightHand.style.opacity = "0";
  leftHand.style.opacity = "0";
  headContainer.style.opacity = "0";
  // headContainer.style.top = "100%"; // Start position (off-screen)

  // Show right hand after 4 seconds
  setTimeout(() => {
    rightHand.style.opacity = "1";
    rightHand.style.transition = "opacity 0.5s ease-in-out";
  }, 4000);

  // Show left hand after 5 seconds
  setTimeout(() => {
    leftHand.style.opacity = "1";
    leftHand.style.transition = "opacity 0.5s ease-in-out";
  }, 5000);

  // Show head after 6 seconds
  setTimeout(() => {
    headContainer.style.top = "-87px"; // Adjust this value as needed
    headContainer.style.opacity = "1";
    headContainer.style.transform = "translateX(-50%)";
    headContainer.style.transition =
      "top 2s ease-out, opacity 0.5s ease-in-out, transform 2s ease-out";
  }, 6000);

  // Hide elements in reverse order after 5 seconds
  setTimeout(() => {
    // Hide head
    headContainer.style.top = "100%"; // Move out of view
    headContainer.style.opacity = "0";
    headContainer.style.transition =
      "top 2s ease-in, opacity 0.5s ease-in, transform 2s ease-in";

    // Hide right hand after an additional delay
    setTimeout(() => {
      rightHand.style.opacity = "0";
      rightHand.style.transition = "opacity 0.5s ease-in-out";

      // Hide left hand after an additional delay
      setTimeout(() => {
        leftHand.style.opacity = "0";
        leftHand.style.transition = "opacity 0.5s ease-in-out";
      }, 500); // Delay to hide left hand after right hand
    }, 2000); // Delay to hide right hand after head
  }, 11000); // Total delay to start hiding the elements
}

// function animateHandsAndHead() {
//   const rightHand = document.querySelector("[alt='Right hand']");
//   const leftHand = document.querySelector("[alt='Left hand']");
//   const headContainer = document.getElementById("headContainer");

//   // Ensure initial state is hidden
//   rightHand.style.opacity = "0";
//   leftHand.style.opacity = "0";
//   //headContainer.style.opacity = "0";
//   // headContainer.style.top = "100%";

//   // Show right hand after 8 seconds
//   setTimeout(() => {
//     rightHand.style.opacity = "1";
//     rightHand.style.transition = "opacity 0.5s ease-in-out";
//   }, 4000);

//   // Show left hand after 10 seconds
//   setTimeout(() => {
//     leftHand.style.opacity = "1";
//     leftHand.style.transition = "opacity 0.5s ease-in-out";
//   }, 5000);

//   // Show head after 12 seconds
//   setTimeout(() => {
//     headContainer.style.top = "-87px"; // Adjust this value as per your need
//     headContainer.style.opacity = "1";
//     headContainer.style.transform = "translateX(-50%)";
//   }, 6000);
// }

// Call the function when needed

function toggleChat() {
  const chatAvatar = document.getElementById("ballWrapper");
  const chat = document.getElementById("chat");
  const chatBox = document.getElementById("innerChat");

  if (isChatVisible) {
    // Closing the chat
    animateHeightChange(chatBox, 500, 100, 500, () => {
      chat.style.display = "none";
      chatAvatar.style.display = "block";
      setTimeout(() => {
        if (chat) {
          chat.style.display = "none";
        }
      }, 500);
    });

    chatAvatar.style.display = "block";
    ballWrapper.style.display = "block";

    isChatVisible = false;
  } else {
    // Opening the chat
    chat.style.display = "block";
    chatAvatar.style.display = "none";

    // Animate height change
    chatBox.style.height = "100px";
    void chatBox.offsetWidth;
    chatBox.style.height = "500px";

    if (!greetingMessageSent && !greetingMessageFlag) {
      // Add typing template
      const chatContainer = document.getElementById("chatDisplay");
      chatContainer.innerHTML += typingTemplate;
      greetingMessageSent = true;
      getGreetingMessage();
      sessionStorage.setItem("greetingMessageFlag", "true");
    } else {
      scrollToBottom();
    }

    isChatVisible = true;
    animateHandsAndHead();
  }
}

// function toggleChat() {
//   const chatAvatar = document.getElementById("ballWrapper");
//   const chat = document.getElementById("chat");
//   const chatBox = document.getElementById("innerChat");

//   if (isChatVisible) {
//     animateHeightChange(chatBox, 500, 100, 500, () => {
//       chat.style.display = "none";
//       chatAvatar.style.display = "block";
//       setTimeout(() => {
//         if (chat) {
//           chat.style.display = "none";
//         }
//       }, 500);
//     });

//     chatAvatar.style.display = "block";
//     ballWrapper.style.display = "block";

//     isChatVisible = false;
//   } else {
//     chat.style.display = "block";
//     chatAvatar.style.display = "none";

//     chatBox.style.height = "100px";
//     void chatBox.offsetWidth;
//     chatBox.style.height = "500px";

//     if (!greetingMessageSent && !greetingMessageFlag) {
//       const chatContainer = document.getElementById("chatDisplay");
//       chatContainer.innerHTML += typingTemplate;
//       greetingMessageSent = true;
//       getGreetingMessage();
//       sessionStorage.setItem("greetingMessageFlag", "true");
//     } else {
//       scrollToBottom();
//     }

//     isChatVisible = true;
//   }
// }

function animateHeightChange(
  element,
  fromHeight,
  toHeight,
  duration,
  callback
) {
  const startTime = performance.now();
  const distance = toHeight - fromHeight;

  function updateHeight(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = (elapsed / duration) * 2;

    if (progress >= 1) {
      element.style.height = toHeight + "px";
      if (callback) {
        callback();
      }
      return;
    }

    const newHeight = fromHeight + distance * progress;
    element.style.height = newHeight + "px";

    requestAnimationFrame(updateHeight);
  }

  requestAnimationFrame(updateHeight);
}

function removeTypingAnimationOnly() {
  const typingElement = document.querySelector(".typing");
  typingElement.remove();
}

// sending message
function sendMessage() {
  const chatBox = document.getElementById("chatbox");
  const userInput = chatBox.value.trim();
  if (userInput !== "") {
    const userMessageTemplate = `
     <li style="display: flex; justify-content: end">
                <p
                    style="${userBubbleStyle}"
                >
                    ${userInput}
                </p>
            </li>
            `;

    const chatDisplay = document.getElementById("chatDisplay");
    chatDisplay.innerHTML += userMessageTemplate;
    scrollToBottom();

    chatBox.value = "";

    chatDisplay.innerHTML += typingTemplate;
    const sendData = {
      clientName: clientName,
      inputs: [userInput],
    };

    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(sendData));
    } else {
      console.error("WebSocket connection is not open");
    }

    saveChatHistory(userMessageTemplate);
  }
}
