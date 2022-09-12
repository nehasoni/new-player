var resources = require("./resource.json");
var scriptLoader = require("./lib/script_loader");
var utils = require('./lib/utils');

var default_config = {
  static_url: "",
  hlsPlayerPath: resources["mxplayer.plugins.js"],
  playerPath: resources["mxplayer.js"],
  fairplayPlayerPath: resources["fairplay.plugins.js"]
};
var Player = function(config, callback) {
  if (!callback) {
    throw new Error("Callback not defined");
  }
  if (document) {
    this.readyCallback = callback;
    this.init(config);
  }
};

Player.prototype.init = function(config) {
  var self = this;
  this.config = default_config;
  for (var key in config) {
    this.config[key] = config[key];
  }
  this.loadVideoPlayer(function(success){
    if(success){
      self.tech = self.config.tech
      self.loadPlayer();
    }
  });
};

Player.prototype.getURL = function(path) {
  if (path[0] !== "/") {
    path = "/" + path;
  }
  return this.config.static_url + path;
}

Player.prototype.loadVideoPlayer = function(callback){
  var files = [{
    url: this.getURL(this.config.playerPath)
    }]
  if(this.config && this.config.adsRequired){
    if(!window.google || !window.google.ima){
      files.push({
        url:"//imasdk.googleapis.com/js/sdkloader/ima3.js",
        optional: true
      })
    }
  }
  scriptLoader(files, function() {
    callback(true);
  }, function(){
    callback();
  });
}
Player.prototype.loadPlayer = function() {
  var self = this;
  if(this.tech == "dash" || this.tech == "dash_widevine"){
    scriptLoader([{
      url: self.getURL(self.config.hlsPlayerPath)
    }], function() {
      self.readyCallback(self);
    });
  }else if (this.tech == "hls" || this.tech == "native_hls") {
    scriptLoader([{
      url: self.getURL(self.config.hlsPlayerPath)
    }], function() {
      self.readyCallback(self);
    });
  }else if(this.tech == "hls_fairplay"){
    scriptLoader([{
      url: self.getURL(self.config.fairplayPlayerPath)
    }], function() {
      self.readyCallback(self);
    });
  }
};

module.exports = {
  MXPlayer: Player,
  utils: utils
};
