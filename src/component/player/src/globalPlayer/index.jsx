import { h, Component } from "preact";


function playVideo(e){
  var video = document.getElementById("global-player")
  try {
    var playPromise = video.play()
    window.__pPromise = playPromise
    playPromise.then(function(){
      video.pause()
      window.__canAutoplay = true
      removeClickHandler()
    }).catch(function(){
      video.pause()
      window.__canAutoplay = true
      removeClickHandler()
    });
  }catch (e) {
    video && video.pause()
    window.__canAutoplay = true
    removeClickHandler()
  }
}

export function checkAutoplay() {
  let video = document.getElementById("global-player")
  let promise = new Promise((resolve) => {
    if(video){
      try {
        let playPromise = video.play()
        playPromise.then( () => {
          resolve(true)
        }).catch( () => {
          resolve(false)
        })
      }catch (e){
        resolve(false)
      }
    }else {
      resolve(false)
    }
  })
  return promise
}

export function addClickHandler(){
  if(!window._usrPlayInit){
    if('ontouchstart' in document.documentElement){
      document.addEventListener('touchstart', playVideo, { passive: true, capture: true })
    }else {
      document.addEventListener('click', playVideo, { passive: true, capture: true })
    }
  }
}

function removeClickHandler(){
  if('ontouchstart' in document.documentElement){
    document.removeEventListener('touchstart', playVideo, { capture: true })
  }else {
    document.removeEventListener('click', playVideo, { capture: true })
  }
}

export default class GlobalPlayer extends Component {

  render() {
    let {sampleURL, browser} = this.props
    if(browser == "opera"){
      sampleURL = ""
    }
    return (
          <video id="global-player" class="mx-player video-js vjs-fluid" playsinline preload="auto" src={sampleURL} controlsList="nodownload" />
    )
  }
}