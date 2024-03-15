const getDate = new Date();
const year = getDate.getFullYear();
const month = (getDate.getMonth() + 1).toString().padStart(2, "0");
const day = getDate.getDate();
const date = `${year}-${month}-${day.toLocaleString()}`;
const hh = getDate.getHours();
const mm = getDate.getMinutes();
const ss = getDate.getSeconds();
const times = `${hh.toLocaleString()}:${mm.toLocaleString()}:${ss.toLocaleString()}`;
const browserNameMapping = {
  Firefox: "Mozilla Firefox",
  "Edg/": "Microsoft Edge",
  Chrome: "Google Chrome",
  Safari: "Apple Safari",
  Opera: "Opera",
  MSIE: "Internet Explorer",
  "Trident/": "Internet Explorer",
};
const characters = 
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const titleElements = document.querySelectorAll("title");
const clientName = titleElements[0].innerHTML;
// HTML template for cookie prompt
const htmlTemplate = `
<div id="cookiePopup" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.5); display: flex; justify-content: center; align-items: center; z-index: 9999;">
  <div class="wrapper" style="background: #fff; position: fixed; bottom: 20px; left: 50px; max-width: 500px; border-radius: 15px; text-align: center; border: 1px solid #493179; padding: 25px; overflow: hidden; box-shadow: 0 0 18px rgba(0, 0, 0, 0.13);">
    <img src="../../assets/img/cookie.png" alt="" style="max-width: 90px;">
    <div class="content" style="margin-top: 10px;">
      <h1 style="font-size: 25px; font-weight: 600;">GDPR Compliance Notice</h1>
      <h5>What data do we collect?</h5>
      <ul style="list-style-type: 'disc'>
        <li>
        We collect personal information such as your name, email address, and location when you sign up for our service or interact with our platform.
         </li>
         <li>We also gather data on your usage patterns, preferences, and interactions with our website/application/service to improve your experience and tailor our offerings to your needs.</li>
      </ul>    
      <div class="buttons" style="display: flex; justify-content: center; align-items: center;">
        <button class="item cancel" onclick="onBlock()" style="padding: 10px 20px; margin: 0 5px; border: none; outline: none; font-size: 16px; font-weight: 500; border-radius: 5px; cursor: pointer; background: #eee; color: #333;">Cancel</button>
        <button class="item accept" onclick="onAccept()" style="padding: 10px 20px; margin: 0 5px; border: none; outline: none; font-size: 16px; font-weight: 500; border-radius: 5px; cursor: pointer; background: #493179; color: #fff;">Accept</button>
      </div>
    </div>
  </div>
</div>
`;

let userDetail = {};
let pageName = "";
let newPageName = "";
let isPageChanged = false;
let id;
let time;
let serverUpdateTime;
let isResponseToDB = false;
let ipAddress;
let ls = {};
let clickCounts = {};

const generateString = (length) => {
  let result = "";
  const charactersLength = characters.length;

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
};

const userAgent = navigator.userAgent;
const browserName =
  Object.keys(browserNameMapping).find((key) => userAgent.includes(key)) ||
  "Unknown Browser";

function storeUserName(value) {
  sessionStorage.setItem("usernames", JSON.stringify(value));
}

if (!getCookie('deviceType')) {
  let deviceTypeInfo = detectDeviceType();
  setCookie('deviceType', deviceTypeInfo, 24);
}

//to get ip adress
fetch("https://api.ipify.org?format=json")
  .then((response) => response.json())
  .then((data) => {
    ipAddress = data.ip;   
    const deviceType = getCookie("deviceType");
    console.log("Device Type:", deviceType);

    userDetail = {
      userInfo: [
        {
          ip: ipAddress,
          userName: generateString(5),
          browserName: browserName,
          dates: date,
          time: times,
          deviceType : deviceType,
          clientName: clientName,
        },
      ],
    };

    try {
      const userNameKey = JSON.parse(sessionStorage.usernames);
      const ipCheck = userNameKey.userInfo[0].ip;
    } catch {
      storeUserName(userDetail);
    }

    const userNameKey = JSON.parse(sessionStorage.usernames);
    const ipCheck = userNameKey.userInfo[0].ip;

    if (ipAddress != ipCheck) {
      storeUserName(userDetail);
    }
  

  })
  .catch((error) => {
    console.error("Error:", error);
  });
  

// Event handler functions
let isCookieCancel = false;
function onAccept() {
  this.getUserRegion();
  closeCookiePopup();
}

function onBlock() {
  closeCookiePopup();
  isCookieCancel = true;
  if(isCookieCancel){
    sendUserInfoToConfig(userDetail.userInfo[0])
  }
}




// Function to close the cookie popup
function closeCookiePopup() {
  const cookiePopup = document.getElementById("cookiePopup");

  if (cookiePopup) {
    cookiePopup.remove();
  }

}

// Function to set cookie with expiry time
function setCookie(name, value, hours) {
  const expires = new Date();
  expires.setTime(expires.getTime() + hours * 60 * 60 * 1000); // Convert hours to milliseconds
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
}

function getUserRegion() {
  
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        const url = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`;

        let userType;

        fetch(url)
          .then((res) => res.json())
          .then((data) => {
            const country = data.address.country;
            const city = data.address.county;
            const storedUserData = sessionStorage.getItem("usernames");

            // Set cookies with expiry time
            setCookie("Country", country, 24);
            setCookie("City", city, 24);            

            for (let i = 0; i < sessionStorage.length; i++) {
              const key = sessionStorage.key(i);
            }

            if (storedUserData) {
              userType = "Authenticated";
            } else {
              userType = "Anonymous";
            }

            const deviceType = getCookie("deviceType");
            console.log("Device Type:", deviceType);

            // Include latitude and longitude in userInfo object
            const userInfo = {
              ip: ipAddress,
              userName: generateString(5),
              userType: userType,
              browserName: browserName,
              dates: date,
              time: times,
              clientName: clientName,
              deviceType : deviceType,
              latitude: latitude,
              longitude: longitude,
              country: country,
            };

            // Send userInfo to the config API
            sendUserInfoToConfig(userInfo);
          });

        setCookie("cookieAccepted", "true", 24);
        setCookie("latitude", latitude, 24);
        setCookie("longitude", longitude, 24);
      },
      (error) => {
        console.error("Error getting user location:", error);
      }
    );
  } else {
    console.log("Geolocation is not supported by this browser.");
  }
}

async function sendUserInfoToConfig(userInfo) {

  try {
    const response = await fetch("https://webanalyticals.onrender.com/config", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userInfo: userInfo,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Error sending userInfo to config API: ${response.status}`
      );
    }

    const configData = await response.json();
    console.log("Config Data:", configData);
    id = configData._id;
    time = configData.serverUpdateTime;
    setCookie("serverUpdateTime", time, 30); // Set a cookie named "userId" with the extracted id that expires in 30 days
    setCookie("userId", id, 30); // Set a cookie named "userId" with the extracted id that expires in 30 days
  }
  catch (error) {
    console.error("Error sending userInfo to config API:", error);
  }
}

// Function to detect the type of device based on user agent
function detectDeviceType() {
  const userAgent = navigator.userAgent;
 
  if (/tablet|ipad|playbook|silk|(android(?!.*mobile))/i.test(userAgent)) {
      return 'tablet';
  } else if (/mobile|iphone|ipod|blackberry|opera mini|iemobile|windows phone|trident|opera mobi|mobilesafari|htc|nokia|sony|symbian|samsung|lg|htc|mot|mot\-/i.test(userAgent)) {
      return 'mobile';
  } else {
      return 'pc';
  }
}

const deviceType = getCookie("deviceType");
console.log("Device Type:", deviceType);

function getCookie(cookieName) {
  const cookies = document.cookie.split(";");

  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();

    if (cookie.indexOf(cookieName + "=") === 0) {
      return cookie.substring(cookieName.length + 1);
    }
  }

  return null;
}

// Function to inject HTML into the DOM
function injectHTML(html) {
  const sessionDetails = getCookie("cookieAccepted");
  
  if (!sessionDetails) {
    const container = document.createElement("div");
    container.innerHTML = htmlTemplate.trim();
    document.body.appendChild(container.firstChild);
  }

}

// Inject HTML template into the DOM after DOMContentLoaded
document.addEventListener("DOMContentLoaded", function () {
  injectHTML(htmlTemplate);
});

function storeUserEvent(value) {
  sessionStorage.setItem("userevents", JSON.stringify(value));
  isResponseToDB = true;
}

function determineCurrentScreen() {
  const currentURL = window.location.href;
  pageName = currentURL.substring(currentURL.lastIndexOf("/") + 1);
}

document.addEventListener("DOMContentLoaded", () => {
  determineCurrentScreen();
});

function changedPageName(isPageChangedtoOtherScreen) {
  
  if (isPageChangedtoOtherScreen) {
    pageName = newPageName;
  }
  return pageName;
}

(function () {
  let captureObject = {};
  let clickCounts = {};
  let responseToDB;
  let requesteDataToDB;

  function updateClickCount(tagId, tagType) {
    let oldObject;
    let userEventData = sessionStorage.getItem("userevents");
    let newObject = JSON.parse(JSON.stringify(userDetail));
    let curretUserEvents;
    let newDerivedObject;

    if (!clickCounts[tagId]) {
      clickCounts[tagId] = 1;
    } else {
      clickCounts[tagId]++;
    }

    const clickCountDisplay = document.getElementById(
      `${tagType}${tagId}_click_count`
    );

    if (clickCountDisplay) {
      clickCountDisplay.textContent = clickCounts[tagId];
    }

    if (!captureObject[pageName]) {
      captureObject[pageName] = {};
    }


    captureObject[pageName][`${tagType}${tagId}`] = clickCounts[tagId];
    userDetail.userEvents = [{ ...captureObject }];
    captureObject = {};
    clickCounts = {};    
    oldObject = [userEventData];
    
    if (oldObject == "" || oldObject == undefined) {
      console.log("New Object"+ JSON.stringify(newObject))
      curretUserEvents = [JSON.parse(JSON.stringify(newObject))];
      newObject.userEvents[0].date = date;
      storeUserEvent([newObject]);
    } else {
      let todayObject = oldObject;

      if (!todayObject) {
        curretUserEvents = oldObject;
        
        newObject.userEvents.forEach((newEvent) => {
          curretUserEvents[0].userEvents.push(newEvent);
        });

      } else {
        newDerivedObject = JSON.parse(todayObject);

        if (newObject.userEvents && Array.isArray(newObject.userEvents)) {
          newObject.userEvents.forEach((newEvent, index) => {
            newDerivedObject[0].userEvents[index] =
              newDerivedObject[0].userEvents[index] || {};

            for (let screen in newEvent) {
              newDerivedObject[0].userEvents[index][screen] =
                newDerivedObject[0].userEvents[index][screen] || {};

              for (let button in newEvent[screen]) {
                newDerivedObject[0].userEvents[index][screen][button] =
                  (newDerivedObject[0].userEvents[index][screen][button] || 0) +
                  (newEvent[screen][button] || 0);
              }
            }
          });
        }

        newDerivedObject[0].userEvents[0].date = date;
        const requestData = newDerivedObject[0];
        storeUserEvent([requestData]);
      }
    }

    responseToDB = sessionStorage.getItem("userevents");

    if (responseToDB) {
      const parsedData = JSON.parse(responseToDB);
      // Access userEvents key
      const userEvents = parsedData[0].userEvents;
      requesteDataToDB = JSON.stringify(userEvents);
    }
  }
  
  async function sendUserEventData() {
    if (isResponseToDB) {
      const userId = getCookie("userId");
      
      const response = await fetch(
        `https://webanalyticals.onrender.com/updateUserEvents/${userId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: requesteDataToDB,
        }
      );

      if (!response.ok) {
        throw new Error(`Error fetching config data: ${response.status}`);
      }
      
    const configData = await response.json();
    console.log("Config Data:", configData);
      sessionStorage.clear();

      if (requesteDataToDB.length) {
        isResponseToDB = false;
        requesteDataToDB = [];
      }
    }
  }
  sendUserEventData(); // Call sendData immediately if there's data
  function sendUserEventDataCall() {
    serverUpdateTime = getCookie("serverUpdateTime");

    if (serverUpdateTime != null) {
      console.log("Server update time"+ serverUpdateTime)
      setInterval(sendUserEventData, 20000);
      clearInterval(setTintervalTimer)
    }
  }

  const setTintervalTimer = setInterval(sendUserEventDataCall, 1000);

  function handleButtonClick(event) {
    const target = event.target;
    const isButton = target.tagName === "BUTTON" || target.closest("button");
    const linkElement = target.tagName === "A" ? target : target.closest("a");

    if (isButton) {
      const buttonElement =
        target.tagName === "BUTTON" ? target : target.closest("button");
      const parentButtonContent = getParentContent(buttonElement, "button");
      updateClickCount(parentButtonContent, "btn_");
      changedPageName(isPageChanged);
    } else if (linkElement) {
      const parentLinkContent = getParentContent(linkElement, "link");
      updateClickCount(parentLinkContent, "link_");
      changedPageName(isPageChanged);
    }

  }

  function getParentContent(element, type) {
    let parentContent = element.textContent.trim();
    let parentElement = element.parentElement.closest(type);

    while (parentElement) {
      parentContent = parentElement.textContent.trim();
      parentElement = parentElement.parentElement.closest(type);
    }
    return parentContent;
  }

  document.addEventListener("click", handleButtonClick);
})();

function startObserving() {
  const observer = new MutationObserver(() => {
    const currentUrl = window.location.href;
    newPageName = currentUrl.substring(currentUrl.lastIndexOf("/") + 1);

    if (newPageName !== pageName) {
      isPageChanged = true;
    }
  });

  const targetNode = document.body;
  const observerConfig = { subtree: true, childList: true };
  observer.observe(targetNode, observerConfig);
}

document.addEventListener("DOMContentLoaded", startObserving);
