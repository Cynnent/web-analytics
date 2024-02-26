const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

const generateString = (length) => {
  let result = "";
  const charactersLength = characters.length;

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
};

const getDate = new Date();
const year = getDate.getFullYear();
const month = (getDate.getMonth() + 1).toString().padStart(2, "0");
const day = getDate.getDate();
const date = `${year}${month}${day.toLocaleString()}`;
const hh = getDate.getHours();
const mm = getDate.getMinutes();
const ss = getDate.getSeconds();
const time = `${hh.toLocaleString()}:${mm.toLocaleString()}:${ss.toLocaleString()}`;

const browserNameMapping = {
  Firefox: "Mozilla Firefox",
  "Edg/": "Microsoft Edge",
  Chrome: "Google Chrome",
  Safari: "Apple Safari",
  Opera: "Opera",
  MSIE: "Internet Explorer",
  "Trident/": "Internet Explorer",
};

const userAgent = navigator.userAgent;
const browserName =
  Object.keys(browserNameMapping).find((key) => userAgent.includes(key)) ||
  "Unknown Browser";

const titleElements = document.querySelectorAll("title");
const clientName = titleElements[0].innerHTML;
let obj = {};

fetch("https://api.ipify.org?format=json")
  .then((response) => response.json())
  .then((data) => {
    const ipAddress = data.ip;
    console.log("User IP address:", ipAddress);

    const storedName = sessionStorage.getItem("usernames");
    obj = {
      userInfo: [
        {
          ip: ipAddress,
          userName: generateString(5),
          browserName,
          dates: date,
          time,
          clientName,
        },
      ],
      userEvents: [],
    };

    if (sessionStorage.usernames) {
      var userNameKey = JSON.parse(sessionStorage.usernames);
      const ipCheck = userNameKey[0].ip;

      if (ipAddress !== ipCheck) {
        storage(obj);
      }
    } else {
      storage(obj);
    }
  })
  .catch((error) => {
    console.error("Error:", error);
  });

function storage(value) {
  sessionStorage.setItem("usernames", JSON.stringify(value));
}

let pageName = "";
let newPageName = "";
let isPageChanged = false;

function determineCurrentScreen() {
  const currentURL = window.location.href;
  pageName = currentURL.substring(currentURL.lastIndexOf("/") + 1);
  console.log(`Current page name: ${pageName}`);
}

document.addEventListener("DOMContentLoaded", () => {
  determineCurrentScreen();
});

function changedPageName(flag) {
  if (flag) {
    pageName = newPageName;
  }
  return pageName;
}

let ls = {};
let clickCounts = {};

(function () {
  let captureObject = {};
  let clickCounts = {};

  function updateClickCount(tagId, tagType) {
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

    obj.userEvents = [];
    captureObject[pageName][`${tagType}${tagId}`] = clickCounts[tagId];
    obj.userEvents = [{ ...captureObject }];
    console.log("User Clicked Events: " + JSON.stringify(obj));
    captureObject = {};
    clickCounts = {};

    let oldObject = {};
    const params = new URLSearchParams({
      ip: obj.userInfo[0].ip,
    });

    const urlWithParams = `https://webanalyticals.onrender.com/getUserData/${params.get(
      "ip"
    )}`;

    fetch(urlWithParams)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        oldObject = data;
        console.log("Response from DB" + JSON.stringify(oldObject));
      })
      .catch((error) => {
        console.error("Fetch error:" + error);
      });
    let newObject = JSON.parse(JSON.stringify(obj));
    function delay() {
      let today = new Date().toISOString().slice(0, 10);
      let oldObjects;
      let newDerivedObject;
      if (oldObject.message == "User not found") {
        oldObjects = [JSON.parse(JSON.stringify(newObject))];
        console.log(
          "Old object was undefined. Assigning newObject to newDerivedObject."
        );
      } else {
        let todayObject = oldObject
          .map((obj) => {
            let userEvent = obj.userEvents.find(
              (event) => event.date === today
            );
            if (userEvent) {
              return {
                ...obj,
                userEvents: [userEvent],
              };
            }
          })
          .filter((obj) => obj !== undefined)[0];

        if (!todayObject) {
          console.log("Today's object not found in oldObject.");
          oldObjects = oldObject;
          newObject.userEvents.forEach((newEvent) => {
            console.log("Events are pushed");
            console.log(JSON.stringify(newEvent));
            newEvent.date = today;
            oldObjects[0].userEvents.push(newEvent);
          });
        } else {
          console.log("Today's object" + JSON.stringify(todayObject));
          todayObject = [todayObject];
          newDerivedObject = JSON.parse(JSON.stringify(todayObject));
          newDerivedObject.userInfo = oldObject[0].userInfo.map((oldInfo) => {
            let newInfo = newObject.userInfo.find(
              (newInfo) => newInfo.ip === oldInfo.ip
            );
            return newInfo ? { ...oldInfo, ...newInfo } : oldInfo;
          });

          if (newObject.userEvents && Array.isArray(newObject.userEvents)) {
            newObject.userEvents.forEach((newEvent, index) => {
              newDerivedObject[0].userEvents[index] =
                newDerivedObject[0].userEvents[index] || {};
              for (let screen in newEvent) {
                newDerivedObject[0].userEvents[index][screen] =
                  newDerivedObject[0].userEvents[index][screen] || {};
                for (let button in newEvent[screen]) {
                  newDerivedObject[0].userEvents[index][screen][button] =
                    (newDerivedObject[0].userEvents[index][screen][button] ||
                      0) + 1;
                }
              }
            });
          }

          function getTotalCount(obj) {
            let totalCount = 0;
            obj[0].userEvents.forEach((event) => {
              if (event.date == today) {
                for (let screen in event) {
                  if (screen !== "date") {
                    for (let button in event[screen]) {
                      totalCount += event[screen][button];
                    }
                  }
                }
              }
            });

            return totalCount;
          }

          const total = getTotalCount(newDerivedObject);
          console.log("Total Count from all screens:", total);
          newDerivedObject[0].userEvents[0].totalCount = total;
          oldObjects = oldObject;
          console.log("New Dervied Object" + JSON.stringify(newDerivedObject));
          newDerivedObject[0].userEvents.forEach((newEvent) => {
            let indexToUpdate = oldObjects[0].userEvents.findIndex(
              (oldEvent) => oldEvent.date === newEvent.date
            );
            console.log("last index" + indexToUpdate);
            console.log("Events are merged");
            oldObjects[0].userEvents[indexToUpdate] = newEvent;
          });
          console.log("Response to send DB" + JSON.stringify(oldObjects));
        }
      }

      if (oldObject !== undefined) {
        storage(newDerivedObject);
      }

      obj.userEvents = [];

      const urls = "https://webanalyticals.onrender.com/storeData";
      const requestData = oldObjects[0];

      fetch(urls, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          console.log(data);
        })
        .catch((error) => {
          console.error("Fetch error:" + error);
        });
    }

    setTimeout(delay, 2000);
  }

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
    console.log("Current URL:", currentUrl);
    newPageName = currentUrl.substring(currentUrl.lastIndexOf("/") + 1);
    console.log("Last index" + newPageName);
    if (newPageName !== pageName) {
      isPageChanged = true;
      console.log("Switched to screen: " + newPageName);
    }
  });

  const targetNode = document.body;
  const observerConfig = { subtree: true, childList: true };
  observer.observe(targetNode, observerConfig);
}

document.addEventListener("DOMContentLoaded", startObserving);
