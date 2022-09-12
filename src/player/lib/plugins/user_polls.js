var defaults = {
  UserPollClass: "vjs-user-poll-container"
};

var Plugin = videojs.getPlugin('plugin');
var UserPolls = videojs.extend(Plugin, {

  constructor: function(player, options) {
    Plugin.call(this, player, options);
    var self = this;
    this.player = player
  },
  init: function(options){
    this.options = options
    this.createCustomControls()
  },

  createCustomControls: function() {
    let options = this.options
    var player = this.player;
    var Component = videojs.getComponent('Component')
    if(!this.container){
      this.container = new Component(player, {})
      this.container.addClass("vjs-user-poll")
      player.addChild(this.container, 0)
    }
    options.showPolls && options.showPolls(this.container.el())
  },
  
  destroyPolls: function(destroyPolls){
    destroyPolls(this.container.el())
    // this.container.dispose()
    // this.player.removeChild(this.container.el())
  }

});

videojs.registerPlugin('userPolls', UserPolls);

module.exports = UserPolls;

