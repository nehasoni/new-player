require("videojs-contrib-quality-levels")
require("./common_plugins")
require("./lib/plugins/drm")
require("./lib/plugins/videojs-widewine")
videojs.options.hls.overrideNative = true
videojs.options.hls.handleManifestRedirects = true
videojs.options.html5.nativeAudioTracks = false
videojs.options.html5.nativeVideoTracks = false
