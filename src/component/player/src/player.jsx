import { h, render, Component } from "preact"
import { MXPlayer } from "../../../../npm_build/dist/player"
import styles from "./style/player.scss"
import playerTechDetection from './lib/techDetection'
import loadImaDai from './lib/loadImaDai'
import selectPlayerTech from './lib/selectTech'
import errorCodes from "./errorCodes"
import DefaultErrorScreen from './errorScreens/default'
import Ad from "./ad"
import errorScreenProps from "./errorScreenProps"

export default class VideoPlayer extends Component {

  constructor(props){
    super(props)
    this.state = {
      canPlay: false,
      errorCode: props.errorCode || 0,
      errorScreenProps: props.errorScreenProps || null,
      initAds: false,
      canAutoplay: false,
      displayFallbackPoster: true
    }
    this.videoMuted = false
    this.firstHeartBeat = true
    this.videoVolume = 1
    this.firstPlay = true
    this.firstHeartBeat = true
    this.adInitialized = false
    this.showingPolls = false
    if(typeof window != "undefined"){
      if(window.localStorage) {
        this.videoMuted = window.localStorage.getItem("muted") == "true"
        let volume = window.localStorage.getItem("volume")
        if(volume){
          this.videoVolume = parseFloat(volume)
        }
      }
    }
    ['onCanPlay', 'onWaiting', 'onLoadedMetaData', 'onReady',
    'onPlay', 'onPause', 'onSeeking', 'onSeeked', 'onPlaying',
    'onOpenSettings', 'onQualitySelection', 'onError', 'onTimeUpdate', 'volumechange',
    'onPlayButtonClick', 'adEnd', 'fetchNextProgram', 'onEnded', 'hideFallbackPoster',
    'requestDaiLiveStream', 'loadDaiLiveStream', 'onStreamEvent', 'renderAds',
    'destroyAds', 'onAutoplay', 'contentResumtionAfterAd', 'onFullscreenchange', 'setLoading', 'setAdPlaying'].map((event) => {
      this[event] = this[event].bind(this)
    })
  }

  initPlayer(props, currentProps){
    props = props || this.props
    var self = this;
    this.autoplay = false;
    this.autoplayCalled = false
    this.showingPolls = false
    this.startTime = (new Date()).getTime();
    this.playTime = 0
    this.prevUpdatedTime = null // To keep track of playtime, by measuring time delta between timeupdate events and adding to total playTime
    // this.state.errorCode= props.errorCode || 0
    this.initializeComponent()
    if(props.errorCode){
      this.setState({
        errorCode: props.errorCode,
        errorScreenProps: props.errorScreenProps
      })
      return
    }
    playerTechDetection().then(function(tech){
      var selectedTech = selectPlayerTech(tech, props.streams, props.isDrmprotected)
      if(!selectedTech){
        if(props.isDrmprotected){
          self.setError(errorCodes.DRM_NOT_SUPPORTED, errorScreenProps.DRM_NOT_AVAILABLE)
        }else if(props.mobile){
          self.setError(errorCodes.VIDEO_STREAMING_NOT_SUPPORTED, errorScreenProps.CANNOT_PLAY_VIDEO)
        }else {
          self.setError(errorCodes.FLASH_NOT_INSTALLED, errorScreenProps.INSTALL_FLASH)
        }
        return
      } else {
        self.setState({
          errorCode: props.errorCode || 0
        })
      }
      new MXPlayer(
        {
          static_url: props.staticUrl,
          adsRequired: props.options.adTagUrl ? true: false,
          tech: selectedTech
        },
        function(player) {
          if(!self.videoContainer){
            return
          }
          self.mxplayer = player
          let playerOptions = self.getPlayerOptions(props)
          self.setState({
            initAds: true
          })
          if(!self.player){
            self.player = videojs(self.videoContainer, playerOptions)
          }else {
            self.player.poster(playerOptions.poster)
            if(self.player.endImagePlugin){
              self.player.endImagePlugin().updateEndImage(playerOptions.poster)
            }
          }
          // self.player.setLoading(true)
          self.player.volume(self.videoVolume)
          self.player.muted(self.videoMuted)
          if(props.mobile){
            self.player.addClass("mobile")
          }
          self.addEventListeners(props)
          if(props.mode === "live" && props.sonyConfig && props.sonyConfig.isSonyLive){
            self.requestDaiLiveStream(props, currentProps)
          } else {
            self.setPlayerSource(props)
          }
          if(props.ready){
            props.ready(self.player);
          }
        }
      )
    })
  }

  setError(errorCode, errorScreenProps){
    this.setState({
      errorCode: errorCode,
      errorScreenProps: errorScreenProps
    })
  }

  setLoading(flag){
    if(flag){
      this.player.addClass('custom-loading')
    } else {
      this.player.removeClass('custom-loading')
    }
  }

  setPlayerSource(props, forceSetStream){
    let streams
    if(forceSetStream){
      streams = {hls: {url: forceSetStream}}
    } else {
      ({streams} = props)
    }
    const {isDrmprotected, loadLicenseManager} = props
    if (isDrmprotected) {
      if (loadLicenseManager) {
        loadLicenseManager().then((licenseManager) => {
          if (licenseManager) {
            const drmPlugin = this.player.drmPlugin()
            drmPlugin.reset({
              licenseManager: licenseManager
            })
            licenseManager.init(this.mxplayer.tech)
          }
          if (this.mxplayer.tech == "hls_fairplay") {
            this.player.src({
              src: streams.hls.url,
              type: 'application/vnd.apple.mpegurl',
              protection: {
                isDrmprotected: isDrmprotected,
                custom: true,
                keySystem: 'com.apple.fps.1_0'
              }
            })
          } else if (this.mxplayer.tech == "dash") {
            if (typeof (this.player.eme) === 'function') {
              this.player.eme && this.player.eme()
            }
            this.player.src({
              src: streams.dash.url, //"https://bitmovin-a.akamaihd.net/content/art-of-motion_drm/mpds/11331.mpd",
              type: 'application/dash+xml',
              keySystems: {
                'com.widevine.alpha': {
                  getLicense: this.player.fetchLicense
                }
              }
            });
          }
        })
      }
    }else {
      if (this.mxplayer.tech == "hls" || this.mxplayer.tech == "native_hls"){
        this.player.src({
          src: streams.hls.url,
          type: 'application/vnd.apple.mpegurl'
        });
      }else {
        this.player.src({
          src: streams.dash.url, //"https://bitmovin-a.akamaihd.net/content/art-of-motion_drm/mpds/11331.mpd",
          type: 'application/dash+xml'
        });
      }
    }
  }

  requestDaiLiveStream(props, currentProps){
    if(window.google && window.google.ima && window.google.ima.dai){
      this.loadDaiLiveStream()
      return
    }
    loadImaDai(this.loadDaiLiveStream)
  }

  loadDaiLiveStream() {
    const streamManager = new google.ima.dai.api.StreamManager(this.videoContainer)
    streamManager.addEventListener(
      [google.ima.dai.api.StreamEvent.Type.LOADED,
        google.ima.dai.api.StreamEvent.Type.ERROR,
        google.ima.dai.api.StreamEvent.Type.AD_BREAK_STARTED,
        google.ima.dai.api.StreamEvent.Type.AD_BREAK_ENDED],
      this.onStreamEvent,
      false)
    const streamRequest = new google.ima.dai.api.LiveStreamRequest()
    const {sonyConfig} = this.props
    streamRequest.assetKey = sonyConfig && sonyConfig.assetId;
    streamRequest.apiKey = '';
    streamManager.requestStream(streamRequest)
  }

  onStreamEvent(e) {
    switch (e.type) {
      case google.ima.dai.api.StreamEvent.Type.LOADED:
        const url = e.getStreamData().url
        this.setPlayerSource(this.props, url)
        break;
      case google.ima.dai.api.StreamEvent.Type.ERROR:
        console.log('Error loading stream, playing backup stream.' + e);
        this.setPlayerSource(this.props)
        break;
      default:
        this.setPlayerSource(this.props)
        break;
    }
  }

  initializeComponent(){
    if(!this.videoContainer) {
      var videoEle = document.getElementById('global-player')
      if(videoEle){
        var videoParent = videoEle.parentNode
        var videoEle = videoParent.removeChild(videoEle)
        videoEle.className = videoEle.className + ` ${this.props.className}`
      }else {
        videoEle = document.createElement('video')
        videoEle.className = `mx-player video-js vjs-fluid ${this.props.className}`
        videoEle.setAttribute("playsinline", "")
        videoEle.preload = "auto"
        videoEle.controlsList = "nodownload"
      }
      videoEle.id = "video-player"
      videoEle.src = ""
      this.container.appendChild(videoEle)
      this.videoContainer = videoEle
    }
  }

  onCanPlay(e){
    var props = this.newProps
    if(!this.state.canPlay){
      this.setState({
        canPlay: true
      })
    }

    if(this.waiting){
      var endTime = (new Date()).getTime();
      var bufferTime = endTime - this.waitingStartTime

      if(props.onBufferEnd){
        props.onBufferEnd(e, this.player, bufferTime)
      }
      this.resetWaitingState()
    }
    // if(this.mxplayer.tech == "dash" && !this.dashAudioSelected){
    //   const mediaPlayer = this.player.tech() && this.player.tech().vhs.mediaPlayer
    //   let currentTrack = mediaPlayer && mediaPlayer.getCurrentTrackFor("audio")
    //   if(currentTrack && currentTrack.roles.indexOf("main") === -1){
    //     let audioTracks = mediaPlayer.getTracksFor("audio")
    //     if(audioTracks && audioTracks.length) {
    //       for(let c=0; c<audioTracks.length; c++){
    //         let track = audioTracks[c]
    //         if(track.roles.indexOf("main") !== -1) {
    //           mediaPlayer.setCurrentTrack(track)
    //         }
    //       }
    //       this.dashAudioSelected = true
    //     }
    //     if(this.props.playVideo) {
    //       this.play()
    //     }
    //   }
    // }
  }

  startMutedPlayer(){
    this.player.muted(true)
    this.setLoading(false)
    this.player.play()
  }

  onLoadedMetaData(e, player){
    var props = this.newProps
    if(props.offset){
      this.player.currentTime(props.offset)
    } else if(props.options.startTime){
      this.player.currentTime(props.options.startTime)
    }
    if(props.options.autoplay) {
      this.autoplay = true
      if(!props.options.adTagUrl){
        this.play()
      }
    }
    this.setLoading(false)
  }

  play(){
    this.setLoading(false)
    let promise = this.player.play()
    if(promise){
      promise.catch((e) => {
        this.startMutedPlayer()
      })
    }
  }
  
  onReady(e, player){
    var props = this.newProps
    var defaultQualityRange = [{
      quality: 360,
      label: 'Low'
    },{
      quality: 480,
      label: 'Medium'
    },{
      quality: 720,
      label: 'High'
    },{
      quality: 1080,
      label: 'HD'
    },{
      quality: 3000,
      label: 'Full HD'
    }]
  }

  onError(e, player) {
    if(this.props.onError) {
      this.props.onError(e, this.player)
    }
  }
  
  onPlay(e, player){
    if(this.adPlaying) this.player.pause();
    var props = this.newProps
    if(this.firstPlay && props.firstPlay){
      this.firstPlay = false
      props.firstPlay()
    }
    window.__canAutoplay = true
    if(props.onPlay){
      props.onPlay(e, this.player)
    }
    if(window.__pPromise && window.__canAutoplay){
      window._usrPlayInit = true
    }
  }
  onAutoplay(e, player) {
    var endTime = (new Date()).getTime();
    var loadTime = endTime - this.startTime
    if(this.props.onAutoplay){
      this.props.onAutoplay(e, this.player, loadTime)
    }
  }

  onPause(e, player) {
    this.prevUpdatedTime = null
    this.resetWaitingState()
    var props = this.newProps
    if(props.onPause){
      props.onPause(e, this.player)
    }
  }

  onSeeking(e, player){
    var props = this.newProps
    if(props.onSeeking){
      props.onSeeking(e, this.player)
    }
  }

  onSeeked(e, player){
    var props = this.newProps
    this.prevUpdatedTime = null
    if(props.onSeeked){
      props.onSeeked(e, this.player)
    }
  }
  resetWaitingState(){
    this.waiting = false;
    this.waitingStartTime = null;
  }

  onPlaying(e, player){
    var props = this.newProps
    if(this.autoplay && !this.autoplayCalled){
      this.onAutoplay(e, this.player);
      this.autoplayCalled = true;
    }
    this.player.removeClass('hide-loading')
    if(props.onPlaying){
      props.onPlaying(e, this.player)
    }
  }

  onWaiting(e, player){
    var props = this.newProps
    this.waiting = true;
    this.prevUpdatedTime = null
    this.waitingStartTime = (new Date()).getTime();
    if(props.onWaiting){
      props.onWaiting(e, this.player)
    }
  }

  onOpenSettings(e){
    if(this.props.onOpenSettings){
      this.props.onOpenSettings(e, this.player)
    }
  }

  onQualitySelection(e, item){
    if(this.props.onQualitySelection){
      this.props.onQualitySelection(item, this.player)
    }
  }

  onTimeUpdate(e){
    let currentTime = this.player.currentTime()
    let deltaTime = this.lastPlayedTime ? (currentTime - this.lastPlayedTime): 0
    this.playTime += Math.abs(deltaTime)
    let playTimeRounded = Math.floor(this.playTime)
    if(playTimeRounded > 0 && playTimeRounded % 2 === 0 && this.firstHeartBeat) {
      if(this.props.onHeartbeat){
        this.props.onHeartbeat(e, this.player, 2)
      }
      this.firstHeartBeat = false
      this.playTime = 0
    }
    if(playTimeRounded > 0 && playTimeRounded % 10 === 0) {
      if(this.props.onHeartbeat){
        this.props.onHeartbeat(e, this.player, 10)
      }
      this.playTime = 0
    }
    this.lastPlayedTime = currentTime
    if(this.props.onTimeUpdate){
      this.props.onTimeUpdate(e, this.player)
    }
  }

  onPlayButtonClick(e){
    if (this.props.onPlayButtonClick){
      this.props.onPlayButtonClick(e, this.player)
    }
  }

  fetchNextProgram(){
    if(this.props.fetchNextProgram){
      this.props.fetchNextProgram()
    }
  }

  onEnded (e) {
    var props = this.newProps
    if (props.onEnded) {
      props.onEnded(e, this.player, props.videoId)
    }
  }

  onFullscreenchange(e){
    var props = this.newProps
    if (props.onFullscreenchange) {
      props.onFullscreenchange(e, this.player, props.videoId)
    }
  }

  volumechange(e){
    const vol = this.player.volume()
    this.videoVolume = vol
    if(this.player.muted()){
      this.videoMuted = true
    } else {
      this.videoMuted = false
    }
  }


  addEventListeners(props){
    this.newProps = props

    this.videoContainer.removeEventListener("canplay", this.onCanPlay)
    this.videoContainer.addEventListener("canplay", this.onCanPlay)

    this.player.off("big_play_button_clicked", this.onPlayButtonClick)
    this.player.on("big_play_button_clicked", this.onPlayButtonClick)

    this.player.off("timeupdate", this.onTimeUpdate)
    this.player.on("timeupdate", this.onTimeUpdate)

    this.player.off("openSettings", this.onOpenSettings)
    this.player.on("openSettings", this.onOpenSettings)

    this.player.off("qualitySelection", this.onQualitySelection)
    this.player.on("qualitySelection", this.onQualitySelection)

    this.player.off("waiting", this.onWaiting)
    this.player.on("waiting", this.onWaiting)

    this.player.off("loadedmetadata", this.onLoadedMetaData)
    this.player.on("loadedmetadata", this.onLoadedMetaData)

    this.player.off("ready", this.onReady);
    this.player.on("ready", this.onReady);

    this.player.off("play", this.onPlay);
    this.player.on("play", this.onPlay);

    this.player.off("pause", this.onPause)
    this.player.on("pause", this.onPause)

    this.player.off("seeking", this.onSeeking)
    this.player.on("seeking", this.onSeeking)

    this.player.off("seeked", this.onSeeked)
    this.player.on("seeked", this.onSeeked)

    this.player.off("playing", this.onPlaying)
    this.player.on("playing", this.onPlaying)

    this.player.off("error", this.onError)
    this.player.on("error", this.onError)

    this.player.off("adend", this.adEnd)
    this.player.on("adend", this.adEnd)

    this.player.off("fetchnextprogram", this.fetchNextProgram)
    this.player.on("fetchnextprogram", this.fetchNextProgram)

    this.player.off("ended", this.onEnded)
    this.player.on("ended", this.onEnded)

    this.player.off("fullscreenchange", this.onFullscreenchange)
    this.player.on("fullscreenchange", this.onFullscreenchange)

    this.player.off("volumechange", this.volumechange)
    this.player.on("volumechange", this.volumechange)
  }

  getPlayerOptions(props){
    var self = this
    props = props || this.props
    var options = Object.assign({}, props.options);
    var config = {
      html5: {nativeCaptions: false},
      controls: options.controls === false ? false : true,
      autoplayEnabled: options.autoplay,
      showMobile: !!options.mobile,
      poster: options.poster,
      resizeManager: options.resizeManager,
      fluid: options.fluid == undefined? true: options.fluid,
      textTrackDisplay: true,
      timeDelta: options.timeDelta || 0,
      tech: this.mxplayer.tech
    };

    config.plugins = {}
    if(["dash", "hls", "native_hls"].indexOf(this.mxplayer.tech) !== -1){
      config.plugins = {
        cuePointsPlugin: this.getCuePointsConfig(),
        qualityChangeDetection: {
          tech: this.mxplayer.tech
        },
        endScreenPlugin: {},
        endImagePlugin: {},
        userPolls: {}
      }
    }
    // if(props.isDrmprotected) {
    //   config.plugins.drmPlugin = {
    //     licenseManager: props.licenseManager
    //   }
    // }

    config.plugins.ads = {
      render: this.renderAds,
      destroy: this.destroyAds
    }
    delete config.autoplay
    return config
  }

  getCuePointsConfig(){
    var config = [];
    if(this.props.cuePoints){
      config = this.props.cuePoints;
    }
    var historyConfig = this.props.history;
    if(historyConfig){
      config.push({
        type: "recurring",
        interval: historyConfig.interval || 10,
        action: (time) => {
          if(historyConfig.update){
            historyConfig.update(time,this.props.videoId);
          }
        }
      });
    }
    return {
      cuepoints: config
    };
  }

  componentDidMount() {
    this.initPlayer()
    const {isBot} = this.props
    if (!isBot) {
      this.hideFallbackPoster()
    }
  }
  hideFallbackPoster() {
    this.setState({
      displayFallbackPoster: false
    })
  }
  adEnd(){
    if(!this.player.muted()){
      this.unMutePlayer()
    }
  }
  unMutePlayer(){
    this.videoMuted = false
    this.player.muted(false)
  }

  componentDidUpdate(nextProps){
    if(!this.player){
      return
    }
    if(nextProps.videoId !== this.props.videoId){
      let adsPlugin = this.player.ads()
      adsPlugin.refresh()
    }
  }

  componentWillReceiveProps(nextProps){
    const {isBot} = nextProps
    if (!isBot) {
      this.hideFallbackPoster()
    }

    let reset = false

    if(nextProps.videoId !== this.props.videoId){
      reset = true
      if(this.showingPolls){
        const userPolls = this.player && this.player.userPolls ? this.player.userPolls() : null
        this.showingPolls = false
        if(userPolls){
          userPolls.destroyPolls(this.props.destroyPolls)
        }
      }
      this.firstPlay = true
      this.firstHeartBeat = true
      this.dashAudioSelected = false

      /* ------ DRM Check Start ------ */
      // if(this.props.isDrmprotected){
      //   let drmPlugin
      //   if(this.player) {
      //     drmPlugin = this.player.drmPlugin ? this.player.drmPlugin(): null
      //   }
      //   if(drmPlugin){
      //     if(nextProps.isDrmprotected){
      //       drmPlugin.reset({
      //         licenseManager: nextProps.licenseManager
      //       })
      //     }
      //   }
      // }else if(nextProps.isDrmprotected && this.player && typeof this.player.drmPlugin == "function"){
      //     this.player.drmPlugin({
      //     licenseManager: nextProps.licenseManager
      //   })
      // }
      /* ------ DRM Check End ------ */
    }

    if(this.player && nextProps.showPolls && !this.showingPolls) {
      const userPolls = this.player.userPolls ? this.player.userPolls() : null
      if(userPolls) {
        userPolls.init({
          showPolls: nextProps.showPolls
        })
        this.showingPolls = true
      }
    }

    const streamChange = this.isStreamUrlChanged(nextProps.streams, this.props.streams)

    /** This is required since we use expiring stream url due to CDN security or due to expiring stream url from third party**/
    if (streamChange) {
      reset = true
    }

    if(reset){
      this.triggerEndEvent(this.props)
      this.updateHistory()
      // this.videoContainer = null
      // this.player && this.player.reset()
      this.initPlayer(nextProps, this.props)
    }
  }
  /** Stream url can change due to expiry on stream url**/
  isStreamUrlChanged(newStreamObject, oldStreamObject) {
    let isChanged = false
    if (newStreamObject && newStreamObject.dash && newStreamObject.dash.url && !oldStreamObject) {
      isChanged = true
    } else if (newStreamObject && newStreamObject.hls && newStreamObject.hls.url && !oldStreamObject) {
      isChanged = true
    } else if (newStreamObject.dash && newStreamObject.dash.url && oldStreamObject.dash && oldStreamObject.dash.url) {
      if (newStreamObject.dash.url !== oldStreamObject.dash.url) {
        isChanged = true
      }
    } else if (newStreamObject.hls && newStreamObject.hls.url && oldStreamObject.hls && oldStreamObject.hls.url) {
      if (newStreamObject.hls.url !== oldStreamObject.hls.url) {
        isChanged = true
      }
    }
    return isChanged
  }
  setAdPlaying(val) {
    this.adPlaying = val;
  }
  renderAds(node, player){
    let { videoId, options, playVideo, mobile, onAdStarted, onAdCompleted } = this.props
    let {initAds} = this.state
    this.adsRoot = render(<Ad
      getPlayer={() => {
        return player
      }}
      setAdPlaying={this.setAdPlaying}
      setLoading={this.setLoading}
      playVideo={playVideo}
      initAds={initAds}
      videoId={videoId}
      options={{
        adTagUrl: options.adTagUrl,
        autoplay: options.autoplay,
        muted: false
      }}
      onContentResumeRequested = {this.contentResumtionAfterAd}
      mobile={mobile}
      onAdStarted={onAdStarted}
      onAdCompleted={onAdCompleted}
    />, node)
  }

  contentResumtionAfterAd(AdDuration){
    
  }

  destroyAds(node){
    render(null, node, this.adsRoot)
  }

  triggerEndEvent(props){
    if(props.onPlayEnd){
      let playTime = parseInt(this.playTime)
      if(playTime < 0){
        playTime = 0
      }
      props.onPlayEnd(this.player, playTime)
    }
  }

  componentWillUnmount(){
    this.updateHistory()
    this.videoContainer = null
    if(this.player){
      try {
        this.destroyAds()
        this.player.pause()
        this.triggerEndEvent(this.props)
        window.setTimeout(() => {
          this.player.dispose()
        }, 0)
      }catch (e){}
    }
  }

  updateHistory(){
    if(this.props.history){
      if(this.player) {
        var time = this.player.currentTime()
        this.props.history.update(time,this.props.videoId)
      }
    }
  }
  getErrorScreen(){
    let {errorScreens} = this.props
    const {errorCode, errorScreenProps} = this.state
    if(errorScreens && errorScreens[errorCode]){
      const ErrorScreen = errorScreens[errorCode]
      return <ErrorScreen {...errorScreenProps}/>
    }
    return <DefaultErrorScreen {...errorScreenProps} />
  }
  getVideoElement() {
    return this.container.querySelector(".mx-player")
  }
  render() {
    var self = this
    let { options, isBot } = this.props
    let {errorCode, displayFallbackPoster} = this.state

    return (
      <div id="mx-player-container" class={`mx-player-container ${errorCode ? 'error-screen': ''}`} >
          <div className="player-container" ref={function(ele) {
            if(ele){
              self.container = ele
            }
            }}>
          </div>
        <img class={`fallback-poster ${displayFallbackPoster ? '' : 'hide'}`} src={options && options.poster}/>
        <div className={`error-screen-container ${isBot ? 'hide' : ''}`}>
          {errorCode && this.getErrorScreen()}
        </div>
      </div>
    )
  }
}
