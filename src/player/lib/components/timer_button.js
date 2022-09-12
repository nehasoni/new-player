var Button = videojs.getComponent("Button")
var TimerButton = videojs.extend(Button, {
    constructor: function(player, options){
      Button.call(this, player, options)
      this.config = options
    },
    createEl: function(tag, props, attr){
        var config = this.options_
        var dimension = config.dimension
        var strokeWidth = 2
        var radius = (dimension - strokeWidth)/2
        var cx = dimension/2
        var cy = strokeWidth/2

        var svg =   '<svg viewbox="0 0 ' + dimension + ' ' + dimension + '"> \
                        <path class="timer-circle" \
                        d="M' + cx + ' ' + cy + ' \
                            a ' + radius + ' ' + radius + ' 0 0 1 0 ' + radius*2 + ' \
                            a ' + radius + ' ' + radius + ' 0 0 1 0 ' + radius*(-2) + '" \
                        /> \
                    </svg>';
    //   var el = Button.prototype.createEl(tag, {
    //     className: 'mxplayer-timer-button',
    //     innerHTML: '<div class="vjs-icon-placeholder"></div><div class="wrapper"><svg class="timer-svg"><circle class="timer-circle" cx="26" cy="26" r="25" stroke-dasharray="157" stroke-dashoffset="157"/></svg></div>'
    //   })

        var el = Button.prototype.createEl(tag, {
            className: 'mxplayer-timer-button',
            innerHTML: '<div class="vjs-icon-placeholder"></div><div class="wrapper" >' + svg + '</div>'
        })
      return el
    },
    reset: function(){
        var button = this.el();
        this.clearTimer();
        button.classList.remove("timer-start");
        button.classList.remove("timer-paused");
    },
    startTimer: function(){
        var self = this
        var button = this.el();
        button.classList.add("timer-start");
        this.timerId = window.setTimeout(function(){
            self.execAction()
        }, this.config.time)
    },
    execAction: function(type){
        if(this.config.action){
            this.config.action(type)
        }
    },
    clearTimer: function(){
        var button = this.el();
        button.classList.add("timer-paused");
        if(this.timerId){
            window.clearTimeout(this.timerId)
        }
    },
    dispose: function(){
        this.clearTimer()
        Button.prototype.dispose.call(this)
    },
    handleClick: function(){
        this.clearTimer()
        this.execAction('click')
    }
  })

module.exports = TimerButton