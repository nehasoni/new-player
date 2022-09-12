var Plugin = videojs.getPlugin('plugin')
var QualityChangeDetectionPlugin = videojs.extend(Plugin, {
  constructor: function(player, options) {
    Plugin.call(this, player, options)
    var self = this
    this.player = player
    this.options = videojs.mergeOptions({}, options)
    this.player.ready(function(){
      self.bindEvents()
    })
  },

  bindEvents: function(){
    var self = this
    if(this.options.tech == "hls"){
      this.player.on("loadedmetadata", function(e, data){
        var tracks = self.player.textTracks()
        var segmentMetadataTrack
        for (var i = 0; i < tracks.length; i++) {
          if (tracks[i].label === 'segment-metadata') {
            segmentMetadataTrack = tracks[i]
          }
        }
        var previousQuality = null
        if (segmentMetadataTrack && segmentMetadataTrack.on) {
          segmentMetadataTrack.on('cuechange', function() {
            var activeCue = segmentMetadataTrack.activeCues[0]
            if (activeCue && activeCue.value.playlist) {
              var representation = null
              var qualityList = self.player.qualityLevels()
              for(var i = 0; i < qualityList.length; ++i) {
                var quality = qualityList[i]
                if(quality.id == activeCue.value.playlist){
                  representation = quality
                }
              }
              if(representation){
                if(representation.height != previousQuality){
                  previousQuality = representation.height
                  self.player.trigger("qualitychange", representation)
                }
              }
            }
          })
        }
      })
    }else if(this.options.tech == "dash") {
      var self = this
      var dash = this.player.dash
      if(dash && dash.mediaPlayer){
        console.log("Adding event listener")
        dash.mediaPlayer.on('qualityChangeRendered', function(data){
          if(data.mediaType != "video"){
            return
          }
          var qualityLevels = dash.mediaPlayer.getBitrateInfoListFor("video")
          var quality = qualityLevels.filter(function(q){
            return q.qualityIndex == data.newQuality
          })
          if(quality.length){
            quality = quality[0]
          }
          self.player.trigger("qualitychange", quality)
        })
      }
    }
  }
})

videojs.registerPlugin('qualityChangeDetection', QualityChangeDetectionPlugin)

module.exports = QualityChangeDetectionPlugin