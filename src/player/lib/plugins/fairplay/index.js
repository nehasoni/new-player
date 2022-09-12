'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /* global videojs, WebKitMediaKeys */

var _util = require('./util');

var _fairplay = require('./fairplay');

var _fairplay2 = _interopRequireDefault(_fairplay);

var _errorType = require('./error-type');

var _errorType2 = _interopRequireDefault(_errorType);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var certificate = void 0;
var logToBrowserConsole = false;
var certificateLoading = false;

var Html5Fairplay = function () {
  _createClass(Html5Fairplay, null, [{
    key: 'setLogToBrowserConsole',
    value: function setLogToBrowserConsole() {
      var value = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

      logToBrowserConsole = value;
    }
  }]);

  function Html5Fairplay(source, tech, options) {
    _classCallCheck(this, Html5Fairplay);
    options = options || tech.options_;

    if (!source.src) {
      return;
    }

    this.el_ = tech.el();
    this.player_ = videojs(options.playerId);
    this.protection_ = source && source.protection;
    this.tech_ = tech;
    this.player_.addClass("hls-fairplay");
    this.onCertificateError = this.onCertificateError.bind(this);
    this.onCertificateLoad = this.onCertificateLoad.bind(this);
    this.onKeySessionWebkitKeyAdded = this.onKeySessionWebkitKeyAdded.bind(this);
    this.onKeySessionWebkitKeyError = this.onKeySessionWebkitKeyError.bind(this);
    this.onKeySessionWebkitKeyMessage = this.onKeySessionWebkitKeyMessage.bind(this);
    this.onLicenseError = this.onLicenseError.bind(this);
    this.onLicenseLoad = this.onLicenseLoad.bind(this);
    this.onVideoError = this.onVideoError.bind(this);
    this.onVideoWebkitNeedKey = this.onVideoWebkitNeedKey.bind(this);

    tech.isReady_ = false;

    this.src(source);

    tech.triggerReady();
  }

  _createClass(Html5Fairplay, [{
    key: 'createKeySession',
    value: function createKeySession(keySystem, initData) {
      this.log('createKeySession()');

      if (!this.el_.webkitKeys) {
        if (WebKitMediaKeys.isTypeSupported(keySystem, 'video/mp4')) {
          this.el_.webkitSetMediaKeys(new WebKitMediaKeys(keySystem));
        } else {
          throw new Error('Key System not supported');
        }
      }

      if (!this.el_.webkitKeys) {
        throw new Error('Could not create MediaKeys');
      }

      var keySession = this.el_.webkitKeys.createSession('video/mp4', initData);

      if (!keySession) {
        throw new Error('Could not create key session');
      }

      return keySession;
    }
  }, {
    key: 'fetchCertificate',
    value: function fetchCertificate(_ref) {
      var _this = this;

      var callback = _ref.callback;

      this.log('fetchCertificate()');
      if(this.protection_.custom){
        this.player_.fetchCertificate().then((cert) => {
          certificateLoading = false
          _this.onCertificateLoad(cert, {
            callback: callback
          });
        }).catch(() => {
          certificateLoading = false
        })
        return
      }
      var certificateUrl = this.protection_.certificateUrl;


      var request = new XMLHttpRequest();

      request.responseType = 'arraybuffer';

      request.addEventListener('error', this.onCertificateError, false);
      request.addEventListener('load', function (event) {
        
      }, false);

      request.open('GET', certificateUrl, true);
      request.send();
    }
  }, {
    key: 'fetchLicense',
    value: function fetchLicense(_ref2) {
      var target = _ref2.target,
          message = _ref2.message;

      this.log('fetchLicense()');

      if(this.protection_.custom){
        this.player_.fetchLicense(message, target.contentId).then((license) => {
          target.update(license)
        })
        return
      }

      var licenseUrl = this.protection_.licenseUrl;


      var request = new XMLHttpRequest();

      request.responseType = 'arraybuffer';
      request.session = target;

      request.addEventListener('error', this.onLicenseError, false);
      request.addEventListener('load', this.onLicenseLoad, false);

      request.open('POST', licenseUrl, true);
      request.setRequestHeader('Content-type', 'application/octet-stream');
      request.send(message);
    }
  }, {
    key: 'getErrorResponse',
    value: function getErrorResponse(response) {
      if (!response) {
        return 'NONE';
      }

      return String.fromCharCode.apply(null, new Uint8Array(response));
    }
  }, {
    key: 'hasProtection',
    value: function hasProtection() {
      var _ref3 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          certificateUrl = _ref3.certificateUrl,
          keySystem = _ref3.keySystem,
          licenseUrl = _ref3.licenseUrl,
          isDrmprotected = _ref3.isDrmprotected;

      this.log('hasProtection()');

      return isDrmprotected || (certificateUrl && keySystem && licenseUrl);
    }
  }, {
    key: 'log',
    value: function log() {
      var _console;

      if (!logToBrowserConsole) {
        return;
      }

      (_console = console).log.apply(_console, arguments);
    }
  }, {
    key: 'onCertificateError',
    value: function onCertificateError() {
      this.log('onCertificateError()');

      this.player_.error({
        code: 0,
        message: 'Failed to retrieve the server certificate.'
      });
    }
  }, {
    key: 'onCertificateLoad',
    value: function onCertificateLoad(cert, _ref4) {
      var callback = _ref4.callback;

      this.log('onCertificateLoad()');

      // var _event$target = event.target,
      //     response = _event$target.response,
      //     status = _event$target.status;


      // if (status !== 200) {
      //   this.onRequestError(event.target, _errorType2.default.FETCH_`CERTIFICA`TE);

      //   return;
      // }

      certificate = cert instanceof Uint8Array ? cert :_util.base64DecodeUint8Array(cert)

      // certificate = new Uint8Array(cert);

      callback();
    }
  }, {
    key: 'onRequestError',
    value: function onRequestError(request) {
      var errorType = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _errorType2.default.UNKNOWN;

      this.log('onRequestError()');

      var errorMessage = errorType + ' - DRM: com.apple.fps.1_0 update, \n      XHR status is \'' + request.statusText + '(' + request.status + ')\', expected to be 200. \n      readyState is \'' + request.readyState + '\'. \n      Response is ' + this.getErrorResponse(request.response);

      this.player_.error({
        code: 0,
        message: errorMessage
      });
    }
  }, {
    key: 'onKeySessionWebkitKeyAdded',
    value: function onKeySessionWebkitKeyAdded() {
      this.log('onKeySessionWebkitKeyAdded()');

      this.log('Decryption key was added to the session.');
      this.player_.error(null)
    }
  }, {
    key: 'onKeySessionWebkitKeyError',
    value: function onKeySessionWebkitKeyError(a,b,c) {
      // this.player_.error({
      //   code: 0,
      //   message: 'A decryption key error was encountered.'
      // });
    }
  }, {
    key: 'onKeySessionWebkitKeyMessage',
    value: function onKeySessionWebkitKeyMessage(event) {
      this.log('onKeySessionWebkitKeyMessage()');
      var message = event.message;
      var target = event.target;

      this.fetchLicense({
        message: message,
        target: target
      });
    }
  }, {
    key: 'onLicenseError',
    value: function onLicenseError() {
      this.log('onLicenseError()');

      this.player_.error({
        code: 0,
        message: 'The license request failed.'
      });
    }
  }, {
    key: 'onLicenseLoad',
    value: function onLicenseLoad(response) {
      this.log('onLicenseLoad()');

      // var _event$target2 = event.target,
      //     response = _event$target2.response,
      //     session = _event$target2.session,
      //     status = _event$target2.status;


      // if (status !== 200) {
      //   this.onRequestError(event.target, _errorType2.default.FETCH_LICENCE);

      //   return;
      // }

      session.update(new Uint8Array(response));
    }
  }, {
    key: 'onVideoError',
    value: function onVideoError() {
      this.log('onVideoError()');

      this.player_.error({
        code: 0,
        message: 'A video playback error occurred.'
      });
    }
  }, {
    key: 'onVideoWebkitNeedKey',
    value: function onVideoWebkitNeedKey(event) {
      this.log('onVideoWebkitNeedKey()');

      var keySystem = this.protection_.keySystem;


      var contentId = (0, _util.getHostnameFromURI)((0, _util.arrayToString)(event.initData));

      var initData = (0, _fairplay2.default)(event.initData, contentId, certificate);

      var keySession = this.createKeySession(keySystem, initData);

      keySession.contentId = contentId;

      keySession.addEventListener('webkitkeyadded', this.onKeySessionWebkitKeyAdded, false);
      keySession.addEventListener('webkitkeyerror', this.onKeySessionWebkitKeyError, false);
      keySession.addEventListener('webkitkeymessage', this.onKeySessionWebkitKeyMessage, false);
    }
  }, {
    key: 'src',
    value: function src(_ref5) {
      var _this2 = this;

      var _src = _ref5.src;

      if (!this.hasProtection(this.protection_)) {
        this.tech_.src(_src);

        return;
      }

      // NOTE: videojs should handle video errors already
      // this.el_.addEventListener('error', this.onVideoError, false);

      // NOTE: videojs must be reset every time a source is changed (to remove existing media keys).
      // WIP: this means that `webkitneedkey` must also be reattached for the license to trigger?
      this.el_.addEventListener('webkitneedkey', this.onVideoWebkitNeedKey, false);

      if (certificate) {
        this.tech_.src(_src);

        return;
      }

      if(!certificateLoading){
        certificateLoading = true
        this.fetchCertificate({
          callback: function callback() {
            _this2.tech_.src(_src);
          }
        });
      }
    }
  }]);

  return Html5Fairplay;
}();

videojs.fairplaySourceHandler = function fairplaySourceHandler() {
  return {
    canHandleSource: function canHandleSource(source) {
      return true
    },
    handleSource: function handleSource(source, tech, options) {
      return new Html5Fairplay(source, tech, options);
    },
    canPlayType: function canPlayType(type) {
      return videojs.fairplaySourceHandler.canPlayType(type);
    }
  };
};

videojs.fairplaySourceHandler.canPlayType = function canPlayType(type) {
  var fairplayTypeRE = /application\/x-mpegURL/i;

  if (fairplayTypeRE.test(type)) {
    return 'maybe';
  }

  return '';
};

// if (window.MediaSource) {
//   var html5 = videojs.getTech('Html5')
//   html5.registerSourceHandler(videojs.fairplaySourceHandler(), 0);
// }

var html5 = videojs.getTech('Html5')
html5.registerSourceHandler(videojs.fairplaySourceHandler(), 0);

videojs.Html5Fairplay = Html5Fairplay;

exports.default = Html5Fairplay;