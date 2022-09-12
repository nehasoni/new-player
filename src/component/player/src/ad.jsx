import { h, render, Component } from "preact"
import {utils} from '@mxplay/player'

export default class Ad extends Component {
  constructor(props) {
    super(props)
    let handlers = ["onAdManagerLoaded", "onAdError", "onContentPauseRequested", "onContentResumeRequested",
    "onPlayerResize", "onAdStarted", "onPlayerStart", "play", "removePlayerListeners", "reset", "onAdPaused",
     "onAdResumed", "onPlayClick", "onAdCompleted", "contentEndedListener"]
    handlers.map((key) => {
      this[key] = this[key].bind(this)
    })
    this.state = {
      adPlaying: false,
      remainingTime: 0,
      skippable: false,
      duration: 0,
      progress: 0,
      adPaused: false
    }
    this.onAddProgress = utils.throttle(this.onAddProgress, 400)
    this.onPlayerResize = utils.debounce(this.onPlayerResize, 50)
    this.adsInitialized = false
  }
  onPlayerResize() {
    if(this.adContainer) {
      let width = this.adContainer.offsetWidth
      let height = this.adContainer.offsetHeight
      this.adsManager && this.adsManager.resize(width, height, google.ima.ViewMode.NORMAL)
    }
  }
  componentDidMount() {
    let { options, initAds } = this.props
    if( options.adTagUrl && initAds) {
      this.initAds(this.props)
    }
  }
  initAds(props) {
    try{
      google && google.ima && google.ima.settings.setDisableCustomPlaybackForIOS10Plus(true)
      let player = props.getPlayer && props.getPlayer()
      this.props.setLoading(true)
      let el = player.el()
      this.videoEl = el.getElementsByTagName("video")[0]
      var adDisplayContainer = new google.ima.AdDisplayContainer(
          this.adContainer,
          this.videoEl
      )
      adDisplayContainer.initialize()
      this.adDisplayContainer = adDisplayContainer
      this.adsInitialized = true
      this.initAdsLoader(props)
      player.on('ended', this.contentEndedListener);
      window.addEventListener("resize", this.onPlayerResize, { passive: true })
    } catch(e){
      this.onAdError(e)
    }
  }
  contentEndedListener() {
    this.adsLoader && this.adsLoader.contentComplete()
  }
  attachAdLoaderEventListeners() {
    this.adsLoader.addEventListener(
      google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
      this.onAdManagerLoaded,
      false
    )
    this.adsLoader.addEventListener(
      google.ima.AdErrorEvent.Type.AD_ERROR,
      this.onAdError,
      false
    )
  }
  componentWillReceiveProps(nextProps){
    let props = this.props
    if((nextProps.initAds && !props.initAds) || (nextProps.videoId && nextProps.videoId !== props.videoId) ){
      if(nextProps.options.adTagUrl){
        if(!this.adsInitialized){
          this.initAds(nextProps)
        }else {
          this.update(nextProps)
        }
      }else {
        this.reset()
      }
    }
  }
  initAdsLoader(props) {
    var adsLoader = new google.ima.AdsLoader(this.adDisplayContainer)
    this.adsLoader = adsLoader
    this.attachAdLoaderEventListeners(props)
    this.attachPlayerListeners(props)
    this.requestAds(props)
  }
  attachPlayerListeners(props) {
    let player = props.getPlayer && props.getPlayer()
    let {options} = props
    if(!options.autoplay){
      player.on("play", this.onPlayerStart)
    }
  }

  removePlayerListeners() {
    let player = this.props.getPlayer && this.props.getPlayer()
    player && player.off("play", this.onPlayerStart)
  }

  onPlayerStart(){
    this.startAdManager()
  }
  startAdManager(){
    let {options} = this.props
    if(!this.adsManagerStarted){
      if(this.adsManager){
        let width = this.videoEl.offsetWidth
        let height = this.videoEl.offsetHeight
        if(options.muted){
          this.adsManager.setVolume(0)
        }
        this.adsManager.init(width, height, google.ima.ViewMode.NORMAL)
        this.adsManager.start()
        this.adsManagerStarted = true
      }
    }
  }
  requestAds() {
    let {options} = this.props
    var adsRequest = new google.ima.AdsRequest()
    adsRequest.adTagUrl = options.adTagUrl
    this.adsLoader.requestAds(adsRequest)
  }
  resetAdEvents() {
    if(this.adsLoader) {
      this.adsLoader.removeEventListener(
        google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
        this.onAdManagerLoaded,
        false
      );
      this.adsLoader.removeEventListener(
        google.ima.AdErrorEvent.Type.AD_ERROR,
        this.onAdError,
        false
      );
    }
    if(this.adsManager) {
      this.adsManager.removeEventListener(
        google.ima.AdErrorEvent.Type.AD_ERROR,
        this.onAdError);
      this.adsManager.removeEventListener(
        google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED,
        this.onContentPauseRequested);
      this.adsManager.removeEventListener(
        google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED,
        this.onContentResumeRequested);
    }
  }
  reset() {
    window.removeEventListener("resize", this.onPlayerResize)
    if(!this.removePlayerListeners && !this.adsLoader && !this.adsManager) { //check when we donot get the right value of this
      return
    }
    this.adsLoader && this.adsLoader.contentComplete()
    this.removePlayerListeners()
    this.resetAdEvents()
    this.setState({
      adPlaying: false
    })
    this.adsManager && this.adsManager.discardAdBreak()
    this.adsManager && this.adsManager.destroy()
    this.adsLoader && this.adsLoader.destroy()
    this.adDisplayContainer && this.adDisplayContainer.destroy()
    this.adsManagerStarted = false
  }
  update(props) {
    this.reset()
    this.initAds(props)
  }

  onAdError(e){
    let player = this.props.getPlayer && this.props.getPlayer()
    this.props.setAdPlaying(false);
    this.props.setLoading(false)
    if(this.props.playVideo){
      this.play()
    }
    this.setState({adPlaying: false});
  }

  onContentPauseRequested(){
    let { onContentPauseRequested } = this.props
    let player = this.props.getPlayer && this.props.getPlayer()
    player.pause()
    player.off('ended', this.contentEndedListener);
    onContentPauseRequested && onContentPauseRequested()
    this.setState({
      adPlaying: true
    })
    this.props.setAdPlaying(true);
  }
  onContentResumeRequested(){
    let { onContentResumeRequested } = this.props
    let player = this.props.getPlayer && this.props.getPlayer()
    player.on('ended', this.contentEndedListener);
    this.setState({
      adPlaying: false
    })
    this.props.setAdPlaying(false);
    if(player.currentTime() !== player.duration()) {
      this.play()
    }
    onContentResumeRequested && onContentResumeRequested(this.duration)
  }

  play(){
    let player = this.props.getPlayer && this.props.getPlayer()
    try {
      let promise = player.play()
      this.props.setLoading(false)
      if(promise) {
        promise.catch((e) => {
          this.props.setLoading(false)
          this.startMutedPlayer()
        })
      }
    }catch (e){
      this.startMutedPlayer()
    }
  }

  startMutedPlayer(){
    let player = this.props.getPlayer && this.props.getPlayer()
    player.muted(true)
    this.props.setLoading(false)
    player.play()
  }
  onAdProgress(){
    if(this.adsManager) {
      let remainingTime = this.adsManager.getRemainingTime()
      let duration = this.duration || 0
      let progress = (duration - remainingTime)*100/duration
      if(progress < 0){
        progress = 0
      }else if(progress > 100){
        progress = 100
      }
      this.setState({
        remainingTime,
        progress
      })
    }
  }
  onAdStarted(e){
    let player = this.props.getPlayer && this.props.getPlayer()
    this.props.setLoading(false)
    if(this.adsManager) {
      let currentAd = this.adsManager.getCurrentAd()
      this.duration = currentAd && currentAd.getDuration()
    }
    this.adInterval = window.setInterval(() => {
      this.onAdProgress()
    }, 10)
    this.setState({adPaused: false});
    this.props.onAdStarted && this.props.onAdStarted()
  }
  
  onAdManagerLoaded(adsManagerLoadedEvent) {
    let {options} = this.props
    let player = this.props.getPlayer && this.props.getPlayer()
    var adsRenderingSettings = new google.ima.AdsRenderingSettings()
    adsRenderingSettings.uiElements = [google.ima.UiElements.AD_ATTRIBUTION, google.ima.UiElements.COUNTDOWN]
    // adsRenderingSettings.useStyledLinearAds = true
    adsRenderingSettings.useStyledLinearAds = false
    let adsManager = adsManagerLoadedEvent.getAdsManager(this.videoEl, adsRenderingSettings)
    this.adsManager = adsManager
    if(options.autoplay){
      this.startAdManager()
    }else {
      this.props.setLoading(false)
    }
    this.adsManager.addEventListener(
        google.ima.AdErrorEvent.Type.AD_ERROR,
        this.onAdError);
    this.adsManager.addEventListener(
        google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED,
        this.onContentPauseRequested);
    this.adsManager.addEventListener(
        google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED,
        this.onContentResumeRequested);
    this.adsManager.addEventListener(
      google.ima.AdEvent.Type.COMPLETE,
      this.onAdCompleted);
    this.adsManager.addEventListener(
        google.ima.AdEvent.Type.ALL_ADS_COMPLETED,
        this.reset);
    this.adsManager.addEventListener(
        google.ima.AdEvent.Type.STARTED,
        this.onAdStarted);
    this.adsManager.addEventListener(
      google.ima.AdEvent.Type.PAUSED,
      this.onAdPaused);
    this.adsManager.addEventListener(
      google.ima.AdEvent.Type.RESUMED,
      this.onAdResumed);
    this.adsManager = adsManager
    window.adsManager = adsManager
  }
  onPlayClick(e) {
    e.stopPropagation();
    this.adsManager.resume();
  }
  onAdPaused() {
    this.setState({adPaused: true})
  }
  onAdResumed() {
    this.setState({adPaused: false})
  }
  onAdCompleted() {
    this.setState({adPaused: false})
    this.props.onAdCompleted && this.props.onAdCompleted()
  }
  componentWillUnmount(){
    this.reset()
    this.adContainer = null
  }

  render() {
    let {adPlaying, progress} = this.state
    return (
      <div className={`mx-ad-container ${adPlaying? 'ad-playing': '' } ${this.props.mobile ? 'mobile' : ''}`} style={{color: "#fff"}} >
        <div className="ad-content" ref={(ele) => {this.adContainer = ele}}></div>
        {this.state.adPaused && 
        <div className="play-overlay" onClick={this.onPlayClick}>
          <div className="play-button">
            <div className="play-icon"></div>
          </div>
        </div>}
        <div className="ads-ui">
          <div className="progress-bar" style={{width: progress + "%"}} />
        </div>
      </div>
    )
  }
}
