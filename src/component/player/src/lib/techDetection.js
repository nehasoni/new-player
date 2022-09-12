import mseDetection from "./mediaSourceDetection"
import emeDetection from "./emeDetection"
import drmDetecttion from './drmDetection'

var nativeHlsSupport = function() {
  var video = document.createElement('video');
  var canPlay = [
    // Apple santioned
    'application/vnd.apple.mpegurl',
    // Apple sanctioned for backwards compatibility
    'audio/mpegurl',
    
    'audio/x-mpegurl',
    'application/x-mpegurl',
    'video/x-mpegurl',
    'video/mpegurl',
    'application/mpegurl'
  ]
  
  return canPlay.some(function(canItPlay) {
    return (/maybe|probably/i).test(video.canPlayType(canItPlay))
  });
}

let html5Supported = function(){
    return !!document.createElement("video").canPlayType
}

let flashSupported = function(){
    return typeof navigator.mimeTypes['application/x-shockwave-flash'] !== undefined
}

let resultPromise

module.exports = function() {
  let result = {
      html5: false,
      native: {
          hls: false
      },
      mse: {
          hls: false,
          dash: false
      },
      flash: false,
      drm: {
          fairplay: false,
          widevine: false
      }
    }

    if(!resultPromise){
        resultPromise = new Promise(function(resolve){
            result.flash = flashSupported()
            result.native.hls = nativeHlsSupport()
            result.html5 = html5Supported()
            if (result.html5) {
                var MSESupported = mseDetection()
                if (MSESupported) {
                    result.mse.hls = true
                    result.mse.dash = true

                }
                var EMESupported = emeDetection()
                if(EMESupported){
                    drmDetecttion().then(function(drm){
                        result.drm = drm
                        resolve(result)
                    })
                }else {
                    resolve(result)
                }
            }else {
                resolve(result)
            }
        })
    }
    return resultPromise
}
