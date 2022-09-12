export default function loadImaDai(callback){
  if(!window.google || !window.google.ima || !window.google.ima.dai){
    var script = document.createElement("script")
    script.onload = callback
    script.onerror = function(){}
    script.src = "//imasdk.googleapis.com/js/sdkloader/ima3_dai.js"
    document.body.appendChild(script)
  }
}
