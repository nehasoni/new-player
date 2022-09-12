var Plugin = videojs.getPlugin('plugin');

var EndImagePlugin = videojs.extend(Plugin, {

  constructor: function(player, options) {
    Plugin.call(this, player, options);
    var self = this;
    this.player = player;
    this.appendEndImage();
  },
  appendEndImage: function(){
    var poster = this.player.options_ ? this.player.options_.poster:''
    var Component = videojs.getComponent("Component")
    var endImage = new Component(this.player, {})
    endImage.addClass("mxplayer-end-image")
    endImage.el().style.backgroundImage = "url(" + poster + ")"
    this.player.addChild(endImage)
    this.endImage = endImage
  },
  updateEndImage: function(url){
    this.endImage.el().style.backgroundImage = "url(" + url + ")"
  }
});

videojs.registerPlugin('endImagePlugin', EndImagePlugin);

module.exports = EndImagePlugin;
