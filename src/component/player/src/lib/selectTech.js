module.exports = function(tech, streams, isDrmprotected) {

    if(!streams){
        return null
    }
    if(isDrmprotected){
        if(tech.drm.widevine && streams.dash && streams.dash.url){
            return "dash"
        }
        if(tech.drm.fairplay && streams.hls && streams.hls.url){
            return "hls_fairplay"
        }
        return null
    }else {
        if(tech.html5){
            if(tech.mse.hls && streams.hls && streams.hls.url) {
                return "hls"
            }
            if(tech.mse.dash && streams.dash && streams.dash.url){
                return "dash"
            }
            if(tech.native.hls && streams.hls && streams.hls.url){
                return "native_hls"
            }
            return null
        }else {
            if(tech.flash){
                return "flash"
            }else {
                return null
            }
        }
    }
}
