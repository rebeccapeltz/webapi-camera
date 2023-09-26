const data = {
  videoEl: null,
  canvasEl: null,
  fileData: null,
  // isStartEnabled: true,
  currentStream: null,
  // isPhoto: false,
  // devices: [],
  constraints: {},
  selectedDevice: null,
  // selectedLabel: null,
  // cameraState: true,
  options: [],
};

function enableBtn(id) {
  let el = document.querySelector(`#${id}`);
  if (el.classList.contains("disabled")) {
    el.classList.remove("disabled");
  }
}
function disableBtn(id) {
  let el = document.querySelector(`#${id}`);
  if (!el.classList.contains("disabled")) {
    el.classList.add("disabled");
  }
}

function hide(id){
  let el = document.querySelector(`#${id}`);
  if (!el.classList.contains("hidden")) {
    el.classList.add("hidden");
  }
}

function show(id){
  let el = document.querySelector(`#${id}`);
  if (el.classList.contains("hidden")) {
    el.classList.remove("hidden");
  }
}

async function deviceChange() {
  stopVideoAndCanvas();
  setConstraints();
  const result = await getMedia();
  // data.cameraState = true;
  console.log("device change:", result);
}

async function start() {
  stop();
  show("video-container");
  // document.querySelector("#video-container").classList.remove("hidden-video");
  enableBtn("camera");

  // debugger;
  const resultDevices = await getDevices();

  // getDevices()
  //   .then((res) => {
  //when first loaded selected device can use 1st option
  data.selectedDevice = data.options[0].value;
  // debugger;
  // data.selectedLabel = data.options[0].text;
  // alert("getDevices:" + data.selectedLabel);
  // document.querySelector("#current-constraint").innerHTML =
  //   "getDevices:" + data.slectedDevice + " " + data.selectedLabel;

  setConstraints();
  // document.querySelector("#current-constraint").innerHTML =
  //   "after setConstraints:" + data.slectedDevice + " " + data.selectedLabel;

  console.log("get devices:", resultDevices);
  // })
  // .then(() => {
  const resultMedia = getMedia();
  if (resultMedia) {
    console.log("get media", resultMedia);

    // getMedia().then((res) => {
    // data.isStartEnabled = false;
    disableBtn("camera");
    // data.cameraState = true;
    enableBtn("stop");
    enableBtn("snapshot");
  }
  //   // getMedia().then((res) => {
  //     data.isStartEnabled = false;
  //     disableBtn("camera");
  //     data.cameraState = true;
  //     enableBtn("stop");
  //     enableBtn("snapshot");
  //     console.log("get media", res);
  //   });
  // });
}

function setConstraints() {
  const videoConstraints = {};

  if (data.selectedDevice === null) {
    videoConstraints.facingMode = "environment";
  } else {
    videoConstraints.deviceId = {
      exact: data.selectedDevice,
    };
  }
  // debugger;
  data.constraints = {
    video: videoConstraints,
    audio: false,
  };
  // debugger
  // document.querySelector("#current-constraint").innerHTML =
  //   "setConstraints:" +
  //   data.selectedDevice +
  //   " " +
  //   data.selectedLabel +
  //   JSON.stringify(data.constraints, null, 2);
}

async function getMedia() {
  try {
    data.stream = await navigator.mediaDevices.getUserMedia(data.constraints);
    window.stream = data.stream;
    data.currentStream = window.stream;
    data.videoEl.srcObject = window.stream;
    return true;
  } catch (err) {
    throw err;
  }
}
function deviceOptionChange() {
  // debugger;
  const el = document.querySelector("#device-option");
  const value = el.value;
  const text = el.options[el.selectedIndex].text;
  data.selectedDevice = value;
  // data.selectedLabel = text;
  // debugger
  // alert("deviceOptionChange: " + data.selectedLabel);
  deviceChange();
}
async function getDevices() {
  // debugger;
  // trigger prompt for permission
  await navigator.mediaDevices.getUserMedia({  video: true });
  if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
    console.log("enumerated devices not supported");
    return false;
  }
  try {
    let allDevices = await navigator.mediaDevices.enumerateDevices();
    data.options = [];
    // clear options before adding
    let select_item = document.querySelector("#device-option");
    let options = select_item.getElementsByTagName("option");
    for (var i = options.length; i--; ) {
      select_item.removeChild(options[i]);
    }

    for (let mediaDevice of allDevices) {
      if (mediaDevice.kind === "videoinput") {
        let option = {};
        option.text = mediaDevice.label;
        option.value = mediaDevice.deviceId;
        data.options.push(option);
        var selection = document.createElement("option");
        selection.value = option.value;
        selection.text = option.text;
        document.querySelector("#device-option").appendChild(selection);
        // data.devices.push(mediaDevice);
      }
      // debugger
      if (options.length > 1) show("device-form");
      // document.querySelector("#device-form").classList.remove("hidden-form");
    }

    return true;
  } catch (err) {
    throw err;
  }
}

function snapShot() {
  show("canvas-container");
  // document.querySelector("#canvas-container").classList.remove("hidden-canvas");
  data.canvasEl.width = data.videoEl.videoWidth;
  data.canvasEl.height = data.videoEl.videoHeight;
  data.canvasEl
    .getContext("2d")
    .drawImage(data.videoEl, 0, 0, data.canvasEl.width, data.canvasEl.height);
  data.fileData = data.canvasEl.toDataURL("image/jpeg");
  // data.isPhoto = true;
  // data.cameraState = false;
  //remove any hidden links used for download
  let hiddenLinks = document.querySelectorAll(".hidden_links");
  for (let hiddenLink of hiddenLinks) {
    document.querySelector("body").remove(hiddenLink);
  }
  enableBtn("download");
}

function stopVideoAndCanvas() {
  data.videoEl.pause();
  if (data.currentStream) {
    data.currentStream.getTracks().forEach((track) => {
      track.stop();
    });
    data.videoEl.srcObject = null;
  }
  if (data.videoEl) {
    data.videoEl.removeAttribute("src");
    data.videoEl.load();
  }
  if (data.canvasEl) {
    data.canvasEl
      .getContext("2d")
      .clearRect(0, 0, data.canvasEl.width, data.canvasEl.height);
  }

  // data.isPhoto = false;
  // data.cameraState = false;
}

function stop() {
  console.log("stop clicked");
  stopVideoAndCanvas();
  // hide video, canvas and form
  hide("video-container");
  // if (document.querySelector("#video-container")) {
  //   document.querySelector("#video-container").classList.add("hidden-video");
  // }
  hide("canvas-container");
  // if (document.querySelector("#canvas-container")) {
  //   document.querySelector("#canvas-container").classList.add("hidden-canvas");
  // }
  if (document.querySelector("#device-form")) {
    hide("device-form");
    // document.querySelector("#device-form").classList.add("hidden-form");
  }
  enableBtn("camera");
  disableBtn("stop");
  disableBtn("download");
  disableBtn("snapshot");
}
function download() {
  // data.canvasEl.width = data.videoEl.videoWidth;
  // data.canvasEl.height = data.videoEl.videoHeight;
  if (data.fileData) {
    // data.canvasEl
    //   .getContext("2d")
    //   .drawImage(data.videoEl, 0, 0, data.canvasEl.width, data.canvasEl.height);
    let a = document.createElement("a");
    a.classList.add("hidden-link");
    a.href = data.fileData;
    a.textContent = "";
    a.target = "_blank";
    a.download = "photo.jpeg";
    document.querySelector("body").append(a);
    a.click();
  }
}

document.addEventListener("DOMContentLoaded", (e) => {
  // const videoContainer = document.querySelector("#video-container");
  // const canvasContainer = document.querySelector("#canvas-container");

  let elements = document.querySelectorAll(".home button");

  elements.forEach((element) => {
    disableBtn(element.id);
  });

  // set video
  data.videoEl = document.querySelector("#video");
  data.canvasEl = document.querySelector("#canvas");

  // attach click event listener
  document.querySelector("#camera").addEventListener("click", (e) => {
    console.log("camera click");
    start();
  });
  document.querySelector("#snapshot").addEventListener("click", (e) => {
    console.log("snapshot click");
    snapShot();
  });
  document.querySelector("#stop").addEventListener("click", (e) => {
    console.log("camera stop");
    stop();
  });
  document.querySelector("#download").addEventListener("click", (e) => {
    console.log("camera downlaod");
    download();
  });

  enableBtn("camera");
});
