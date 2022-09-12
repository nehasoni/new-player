var Plugin = videojs.getPlugin('plugin');

var EndScreenPlugin = videojs.extend(Plugin, {

  constructor: function(player, options) {
    Plugin.call(this, player, options);
    var self = this;
    this.player = player;
    this.appendEndScreen();
  },
  appendEndScreen: function(){
    var poster = this.player.options_ ? this.player.options_.poster:''
    var Component = videojs.getComponent("Component")
    var endScreen = new Component(this.player, {})
    endScreen.addClass("mxplayer-endscreen")
    this.player.endScreen = endScreen
    this.player.addChild(endScreen)
  }
});

videojs.registerPlugin('endScreenPlugin', EndScreenPlugin);

module.exports = EndScreenPlugin;
