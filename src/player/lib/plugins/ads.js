var Plugin = videojs.getPlugin('plugin');
var Ads = videojs.extend(Plugin, {

  constructor: function(player, options) {
    Plugin.call(this, player, options);
    var self = this
    this.options = options
    this.player = player
    this.player.on('ready', function(){
      self.init()
    })
  },
  init: function(){
    var Component = videojs.getComponent('Component')
    if(!this.container){
      this.container = new Component(this.player, {})
      this.container.addClass("mx-ads-container")
      this.player.addChild(this.container, 0)
    }
    this.renderAds()
  },
  renderAds: function(){
    this.options.render && this.options.render(this.container.el(), this.player)
  },
  refresh: function(){
    this.destroyAds()
    // this.renderAds()
  },
  destroyAds: function(){
    if(this.container){
      this.options.destroy && this.options.destroy(this.container.el())
    }
  }

});

videojs.registerPlugin('ads', Ads);

module.exports = Ads;
