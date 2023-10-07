const data = {
  videoEl: null,
  canvasEl: null,
  fileData: null,
  currentStream: null,
  constraints: {},
  selectedDevice: null,
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

function hide(id) {
  let el = document.querySelector(`#${id}`);
  if (!el.classList.contains("hidden")) {
    el.classList.add("hidden");
  }
}

function show(id) {
  let el = document.querySelector(`#${id}`);
  if (el.classList.contains("hidden")) {
    el.classList.remove("hidden");
  }
}

async function deviceChange() {
  stopVideoAndCanvas();
  setConstraints();
  const result = await getMedia();
  console.log("device change:", result);
}

async function start() {
  stop();
  show("video-container");
  enableBtn("camera");

  const resultDevices = await getDevices();
  data.selectedDevice = data.options[0].value;
  setConstraints();
  console.log("get devices:", resultDevices);
  const resultMedia = getMedia();
  if (resultMedia) {
    console.log("get media", resultMedia);
    disableBtn("camera");
    enableBtn("stop");
    enableBtn("snapshot");
  }
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
  data.constraints = {
    video: videoConstraints,
    audio: false,
  };
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
  const el = document.querySelector("#device-option");
  const value = el.value;
  const text = el.options[el.selectedIndex].text;
  data.selectedDevice = value;
  deviceChange();
}
function getOptionTextFromLabel(label) {
  // debugger
  let text = "Back Facing"; //default
  if (label.toUpperCase().search("FRONT") >= 0) text = "Front facing";
  return text;
}

async function getDevices() {
  await navigator.mediaDevices.getUserMedia({ video: true });
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

    // add options to camera facing selector
    const videoInputDevices = allDevices.filter(
      (device) => device.kind === "videoinput"
    );
    videoInputDevices.forEach((device) => {
      let option = {};
      option.text = device.label;
      option.value = device.deviceId;
      data.options.push(option);
      var selection = document.createElement("option");
      selection.value = option.value;
      selection.text = option.text;
      document.querySelector("#device-option").appendChild(selection);
    });
    if (options.length >= 1) show("device-form");
    return true;
  } catch (err) {
    throw err;
  }
}

function snapShot() {
  show("canvas-container");
  data.canvasEl.width = data.videoEl.videoWidth;
  data.canvasEl.height = data.videoEl.videoHeight;
  data.canvasEl
    .getContext("2d")
    .drawImage(data.videoEl, 0, 0, data.canvasEl.width, data.canvasEl.height);
  data.fileData = data.canvasEl.toDataURL("image/jpeg");
  let hiddenLinks = document.querySelectorAll(".hidden_links");
  for (let hiddenLink of hiddenLinks) {
    document.querySelector("body").remove(hiddenLink);
  }
  enableBtn("download");
  enableBtn("share");
  show("share");
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
}

function stop() {
  console.log("stop clicked");
  stopVideoAndCanvas();
  // hide video, canvas and form
  hide("video-container");
  hide("canvas-container");
  if (document.querySelector("#device-form")) {
    hide("device-form");
  }
  enableBtn("camera");
  disableBtn("stop");
  disableBtn("download");
  disableBtn("snapshot");
  disableBtn("share");
}
function download() {
  if (data.fileData) {
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

async function share() {
  // debugger
  let blob = await (await fetch(data.fileData)).blob();
  const filesArray = [
    new File([blob], "snapshot.jpg", {
      type: blob.type,
      lastModified: new Date().getTime(),
    }),
  ];
  const shareData = {
    files: filesArray,
  };
  try {
    await navigator.share(shareData);
    alert("shared successfully");
  } catch (error) {
    alert("error attempting to share");
    console.log(error);
  }
}

document.addEventListener("DOMContentLoaded", (e) => {
  let elements = document.querySelectorAll(".home button");

  elements.forEach((element) => {
    disableBtn(element.id);
  });

  // set video
  data.videoEl = document.querySelector("#video");
  data.canvasEl = document.querySelector("#canvas");

  // attach click event listeners
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
  document.querySelector("#share").addEventListener("click", (e) => {
    console.log("camera share");
    share();
  });

  enableBtn("camera");
});
