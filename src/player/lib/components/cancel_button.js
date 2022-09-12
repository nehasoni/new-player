var Button = videojs.getComponent("Button")
var CancelButton = videojs.extend(Button, {
    constructor: function(player, options){
      Button.call(this, player, options)
      this.config = options
    },
    createEl: function(tag, props, attr){
      var el = Button.prototype.createEl(tag, {
        className: 'mxplayer-cancel-button',
        innerHTML: 'Cancel'
      })
      return el
    },
    handleClick: function(){
        if(this.config.action){
            this.config.action()
        }
    }
  })

module.exports = CancelButton