
var Plugin = videojs.getPlugin('plugin');
var defaults = {}
var DrmPlugin = videojs.extend(Plugin, {

  constructor: function(player, options) {
    Plugin.call(this, player, options)
    this.player = player
    this.config = videojs.mergeOptions(defaults, options)
    this.attachDRMMethods()
  },
  attachDRMMethods: function(){
    var self = this;
    this.player.fetchCertificate = function(){
      if(self.config){
        var args = self.getArguments(arguments)
        if(self.config.fetchCertificate){
          return self.config.fetchCertificate.apply(null, args)
        }else if(self.config.licenseManager){
          return self.config.licenseManager.getCertificate.apply(null, args)
        }
      }
    }

    this.player.fetchLicense = function(){
      if(self.config){
        var args = self.getArguments(arguments)
        if(self.config.fetchLicense){
          return self.config.fetchLicense.apply(null, args)
        }else if(self.config.licenseManager){
          return self.config.licenseManager.getLicense.apply(null, args)
        }
      }
    }
  },
  reset: function(options){
    this.config = videojs.mergeOptions(defaults, options)
  },
  dispose: function(){
    this.player.fetchCertificate = null
    this.player.fetchLicense = null
  },
  getArguments: function(args){
    var newArgs = []
    for(var i=0; i < args.length; i++){
      newArgs.push(args[i])
    }
    return newArgs
  }
});

videojs.registerPlugin('drmPlugin', DrmPlugin);

module.exports = DrmPlugin;