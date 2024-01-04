const submitBtn = document.querySelector("#submit-button");
const status = document.querySelector(".status");
const connectionForm = document.querySelector("#connection-form");
const tileController = document.querySelector(".tile-controller");
const tileImg = document.querySelector(".tile-img");

let lightControllerStatus = "OFF";
let lightControllerName = "";
const deviceInfo = window.navigator.userAgent;
const uuid = getUUID();

const WebSocketConfig = LxCommunicator.WebSocketConfig;

const config = new WebSocketConfig(
  WebSocketConfig.protocol.WS,
  uuid,
  deviceInfo,
  WebSocketConfig.permission.APP,
  false
);

const socket = new LxCommunicator.WebSocket(config);

connectionForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const values = Object.fromEntries(formData);
  lightControllerName = values.controllerName;

  await establishConnection(values.address);
});

tileImg.addEventListener("click", () => {
  toggleLightController();
});

async function establishConnection(ip) {
  submitBtn.setAttribute("disabled", true);
  status.innerHTML = "Connecting...";
  try {
    await socket.open(ip, "admin", "admin");
    status.innerHTML = "Connection Established... Please wait.";
    await toggleLightController(lightControllerName);
  } catch (error) {
    status.innerHTML = "Connection Failed";
    submitBtn.setAttribute("disabled", false);
    console.error(error);
  }
}

async function toggleLightController(lightControllerName) {
  if (lightControllerStatus === "OFF") {
    lightControllerStatus = "ON";
    status.innerHTML = "Turning ON Lighting Controller...";
    await toggleController(lightControllerName, "On");
  } else {
    lightControllerStatus = "OFF";
    status.innerHTML = "Turning OFF Lighting Controller...";
    await toggleController(lightControllerName, "Off");
  }

  status.innerHTML = "Successful!";
  connectionForm.style.display = "none";
  tileController.style.display = "block";
}

async function toggleController(lightControllerName, action = "On") {
  try {
    const response = await socket.send(
      `jdev/sps/io/${lightControllerName}/SET(Lico;${action};${action})`
    );
    if (response) {
      tileButtonColor();
    }
  } catch (error) {
    status.innerHTML = "Something went wrong...";
    console.log(error);
  }
}

function getUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function tileButtonColor() {
  if (lightControllerStatus === "OFF") {
    tileImg.style.background = "red";
  } else tileImg.style.background = "lightgreen";
}
