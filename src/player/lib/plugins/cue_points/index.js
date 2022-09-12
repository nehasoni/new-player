var Utils = require("../../utils");
var Plugin = videojs.getPlugin('plugin');
var CuePointsPlugin = videojs.extend(Plugin, {
  constructor: function(player, options) {
    Plugin.call(this, player, options);
    var self = this;
    this.cuePointListeners = []
    this.pastCues = {}
    this.player = player;
    this.player.ready(function(){
      self.init(options);
    });
  },
});

CuePointsPlugin.prototype.init = function(options){
  var self = this;
  if(options.cuepoints && options.cuepoints.length > 0){
    options.cuepoints.map(function(cP, i){
        var id = cP.name || (i + "-" + new Date().getTime());
        self.addCuePoint(id, cP)
    });
    self.adEventListener();
  }
}

CuePointsPlugin.prototype.adEventListener = function(){
  var self = this;
  this.player.on("timeupdate", function(){
    var time = self.player.currentTime();
    self.cuePointListeners.map(function(v){
      v.action(time);
    })
  });
}

CuePointsPlugin.prototype.addCuePoint = function(id, options) {
  
  var listener = (function(time) {
    if (options.type === 'recurring' && !options.interval) {
      throw new Error("No time interval defined for recurring Cue point "+ id)
    }
    var currentTime = Math.floor(time)
      if (options.type === 'recurring') {
        if (currentTime > 0 || options.triggerAtZero) {
          if (currentTime % options.interval == 0) {
            if (options.action) {
              options.action(currentTime);
            }
          }
        }
      } else {
        if (options.action) {
          if (currentTime === options.time) {
            options.action(currentTime)
          }
        }
      }
  }).bind(this)

  this.cuePointListeners.push({
    id: id,
    action: Utils.throttle(listener, 1000)
  });

}
CuePointsPlugin.prototype.removeCuePoint = function(id){
  var cuePointListeners = [].concat(this.cuePointListeners);
  cuePointListeners = cuePointListeners.filter(function(v){
    return v.id !== id;
  });
  this.cuePointListeners = cuePointListeners;
}


// Register the plugin with video.js.
videojs.registerPlugin('cuePointsPlugin', CuePointsPlugin);
module.exports = CuePointsPlugin;