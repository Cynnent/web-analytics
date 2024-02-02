// random user name generation
const characters =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
function generateString(length) {
  let result = " ";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
//To find the browser
let browserName = "";
let userAgent = navigator.userAgent;
console.log(userAgent);
if (userAgent.indexOf("Firefox") > -1) {
  browserName = "Mozilla Firefox";
} else if (userAgent.search("Edg/") > -1) {
  browserName = "Microsoft Edge";
} else if (userAgent.indexOf("Chrome") > -1) {
  browserName = "Google Chrome";
} else if (userAgent.indexOf("Safari") > -1) {
  browserName = "Apple Safari";
} else if (userAgent.indexOf("Opera") > -1) {
  browserName = "Opera";
} else if (
  userAgent.indexOf("MSIE") > -1 ||
  userAgent.indexOf("Trident/") > -1
) {
  browserName = "Internet Explorer";
} else {
  browserName = "Unknown Browser";
}
//logged time and date
let getDate = new Date();
let year = getDate.getFullYear();
let month = (getDate.getMonth() + 1).toString().padStart(2, "0");
let day = getDate.getDate();
let date = year + "" + month + "" + day.toLocaleString();
let hh = getDate.getHours();
let mm = getDate.getMinutes();
let ss = getDate.getSeconds();
let time =
  hh.toLocaleString() + ":" + mm.toLocaleString() + ":" + ss.toLocaleString();
let obj = {};
 
//function to store in Session storage
function storage(value) {
  sessionStorage.setItem("usernames", JSON.stringify(value));
}
 
const titleElements = document.querySelectorAll('title');
const clientName = titleElements[0].innerHTML;
 
//to get ip adress
fetch("https://api.ipify.org?format=json")
  .then((response) => response.json())
  .then((data) => {
    const ipAddress = data.ip;
    console.log("User IP address:", ipAddress);
    var storedName = sessionStorage.getItem("usernames");
    obj = {
      userInfo: [
        {
          ip: ipAddress,
          userName: generateString(5), //"zoL1j"
          browserName: browserName,
          dates: date,
          time: time,
          clientName : clientName
        },
      ],
      userEvents: [],
    };
    try {
      var userNameKey = JSON.parse(sessionStorage.usernames);
      var ipCheck = userNameKey.userInfo[0].ip;
    } catch {
      storage(obj);
    }
    var userNameKey = JSON.parse(sessionStorage.usernames);
    var ipCheck = userNameKey.userInfo[0].ip;
    if (ipAddress != ipCheck) {
      storage(obj);
    }
  })
  .catch((error) => {
    console.error("Error:", error);
  });
let pageName = "";
function determineCurrentScreen() {
  let currentURL = window.location.href;
  pageName = currentURL.substring(currentURL.lastIndexOf("/") + 1);
  console.log("Current page name: " + pageName);
}
 
document.addEventListener("DOMContentLoaded", function () {
  determineCurrentScreen();
});
function changedPagename(flag) {
  if (flag) {
    pageName = newPageName;
  }
  return pageName;
}
let ls = {};
let clickCounts = {};
let newPageName = "";
let isPageChanged = false;
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
 
    // Update captureObject with nested structure
    if (!captureObject[pageName]) {
      captureObject[pageName] = {};
    }
    obj.userEvents = [];
 
    captureObject[pageName][`${tagType}${tagId}`] = clickCounts[tagId];
 
    obj.userEvents = [{ ...captureObject }];
    console.log("User Clicked Events: "+JSON.stringify(obj));
    captureObject = {}
    // storage(obj);
   //let oldObject = {"userInfo":[{"ip":"202.83.17.212","userName":" WhslD","browserName":"Google Chrome","dates":"20240112","time":"12:47:3"}],"userEvents":[{"screen1":{"btn_ login":0,"btn_ signup":0,"btn_ home":0,"link_Go to Screen 2":0},"screen2":{"btn_ create ":0,"btn_ delete":0, "btn_ deletess":0,"btn_ updatedd":0}}]};
   let oldObject = {}
   const params = new URLSearchParams({
    ip: obj.userInfo[0].ip,
  });
 
  const urlWithParams = `https://webanalyticals.onrender.com/getUserData/${params.get('ip')}`;
 
  fetch(urlWithParams)
    .then((response) => {
       // Check if the request was successful (status code 200)
       if (!response.ok) {
         //throw new Error(`HTTP error! Status: ${response.status}`);
       }
       return response.json(); // Assuming the response is in JSON format
     })
     .then(data => {
       // Now, 'data' contains the information from the API
       // Do something with the data here
       oldObject = data;
       console.log("Response from DB"+ JSON.stringify(oldObject));
     })
     .catch(error => {
       console.error('Fetch error:'+  error);
     });
    let newObject = JSON.parse(JSON.stringify(obj));
function delay() {
  // Find today's date
  let today = new Date().toISOString().slice(0, 10); // Get today's date in YYYY-MM-DD format
    let oldObjects;
let newDerivedObject;
  if (oldObject.message == "User not found") {
    oldObjects =[JSON.parse(JSON.stringify(newObject))];
    console.log("Old object was undefined. Assigning newObject to newDerivedObject.");
  } else {
    let todayObject = oldObject.map(obj => {
      let userEvent = obj.userEvents.find(event => event.date === today);
      if (userEvent) {
          return {
              ...obj,
              userEvents: [userEvent] // Only include the user event for today's date
          };
      }
  }).filter(obj => obj !== undefined)[0]; // Filter out undefined values and get the first (and only) result
 
  if (!todayObject) {
      console.log("Today's object not found in oldObject.");
      oldObjects = oldObject
    //console.log("New Dervied Object" + JSON.stringify(newDerivedObject));
   // newObject.userEvents.date == today;
 
    newObject.userEvents.forEach(newEvent => {
      // Find the index of the matching date in oldObject's userEvents array
      // let indexToUpdate = oldObjects[0].userEvents.findIndex(oldEvent => oldEvent.date === newEvent.date);
      // console.log("last index"+indexToUpdate)
     
      // if (indexToUpdate == 1) {
        // If a matching date is found, merge the events
        console.log("Events are pushed")
        console.log(JSON.stringify(newEvent))
        newEvent.date = today;
        oldObjects[0].userEvents.push(newEvent);
    // } else {
    //     // If no matching date is found, add the new event to the oldObject's userEvents array
    //     console.log("If no matching date is found, add the new event to the oldObject's userEvents array")
    //     oldObject[0].userEvents.push(newEvent);
    // }
  });
     // oldObjects = [JSON.parse(JSON.stringify(newObject))];
     
  } else {
      console.log("Today's object"+JSON.stringify(todayObject));
      todayObject = [todayObject]
 
    newDerivedObject = JSON.parse(JSON.stringify(todayObject));
 
    // Merge userInfo
    newDerivedObject.userInfo = oldObject[0].userInfo.map(oldInfo => {
      let newInfo = newObject.userInfo.find(newInfo => newInfo.ip === oldInfo.ip);
      return newInfo ? { ...oldInfo, ...newInfo } : oldInfo;
    });
 
    // Merge userEvents
    if (newObject.userEvents && Array.isArray(newObject.userEvents)) {
      newObject.userEvents.forEach((newEvent, index) => {
        newDerivedObject[0].userEvents[index] = newDerivedObject[0].userEvents[index] || {};
        for (let screen in newEvent) {
          newDerivedObject[0].userEvents[index][screen] = newDerivedObject[0].userEvents[index][screen] || {};
          for (let button in newEvent[screen]) {
              newDerivedObject[0].userEvents[index][screen][button] = (newDerivedObject[0].userEvents[index][screen][button] || 0) + 1//(newEvent[screen][button] || 0);
          }
        }
      });
    }
    function getTotalCount(obj) {
      let totalCount = 0;
   
      obj[0].userEvents.forEach(event => {
        if(event.date == today){
          for (let screen in event) {
            if (screen !== 'date') {
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
    newDerivedObject[0].userEvents[0].totalCount = total
     oldObjects = oldObject
    console.log("New Dervied Object" + JSON.stringify(newDerivedObject));
    newDerivedObject[0].userEvents.forEach(newEvent => {
      // Find the index of the matching date in oldObject's userEvents array
      let indexToUpdate = oldObjects[0].userEvents.findIndex(oldEvent => oldEvent.date === newEvent.date);
      console.log("last index"+indexToUpdate)
     
      // if (indexToUpdate == 1) {
        // If a matching date is found, merge the events
        console.log("Events are merged")
        oldObjects[0].userEvents[indexToUpdate] = newEvent;
    // } else {
    //     // If no matching date is found, add the new event to the oldObject's userEvents array
    //     console.log("If no matching date is found, add the new event to the oldObject's userEvents array")
    //     oldObject[0].userEvents.push(newEvent);
    // }
  });
  console.log("Response to send DB"+JSON.stringify(oldObjects));
  }
}
 
 
 
 
 
 
  // newDerivedObject[0].userEvents[0].totalCount = total
  // Check if oldObject is undefined before sending to storage
  if (oldObject !== undefined) {
    storage(newDerivedObject);
  }
 
  obj.userEvents = [];
 
  const urls = "https://webanalyticals.onrender.com/storeData";
 
  // Sample data to be sent to the API
  const requestData = oldObjects[0];
 
  //Make a POST request with the data
  fetch(urls, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Add any additional headers as needed
    },
    body: JSON.stringify(requestData),
  })
    .then(response => {
      // Check if the request was successful (status code 200)
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json(); // Assuming the response is in JSON format
    })
    .then(data => {
      // Handle the response data here
      console.log(data);
    })
    .catch(error => {
      console.error('Fetch error:' + error);
    });
}
 
setTimeout(delay, 2000);
  }
 
  function handleButtonClick(event) {
    const target = event.target;
 
    if (target.tagName === "BUTTON") {
      const buttonId = target.textContent;
      updateClickCount(buttonId, "btn_");
      changedPagename(isPageChanged);
    }
 
    if (target.tagName === "A") {
      const linkId = target.textContent;
      updateClickCount(linkId, "link_");  
      changedPagename(isPageChanged);
    }
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
  // Use document.body as the target node
  const targetNode = document.body;
  const observerConfig = { subtree: true, childList: true };
  observer.observe(targetNode, observerConfig);
}
 
// Run the observer after the DOM has fully loaded
document.addEventListener("DOMContentLoaded", startObserving);