function checkWidevine(){
  var config = [{
    "initDataTypes": ["cenc"],
    "audioCapabilities": [{
      "contentType": "audio/mp4;codecs=\"mp4a.40.2\""
    }],
    "videoCapabilities": [{
      "contentType": "video/mp4;codecs=\"avc1.42E01E\""
    }]
  }];
  return new Promise(function(resolve){
    try {
      navigator.
      requestMediaKeySystemAccess("com.widevine.alpha", config).
      then(function() {
        resolve(true)
      }).catch(function(e) {
        resolve(false)
      });
    } catch (e) {
      resolve(false)
    }
  })
}

function checkFairplay(){

  var supported = false
  if('WebKitMediaKeys' in window){
    supported = window.WebKitMediaKeys.isTypeSupported("com.apple.fps.1_0", 'video/mp4')
  }
  return Promise.resolve(supported)
}
export default function() {
  let result = {
    fairplay: false,
    widevine: false
  }
  return Promise.all([checkWidevine(), checkFairplay()]).then(function([widevine, fairplay]){
    result.fairplay = fairplay
    result.widevine = widevine
    return result
  })
  
};