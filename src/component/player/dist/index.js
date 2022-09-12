"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "ErrorCodes", {
  enumerable: true,
  get: function get() {
    return _errorCodes["default"];
  }
});
Object.defineProperty(exports, "GlobalPlayer", {
  enumerable: true,
  get: function get() {
    return _globalPlayer["default"];
  }
});
Object.defineProperty(exports, "ImaLoader", {
  enumerable: true,
  get: function get() {
    return _imaLoader["default"];
  }
});
Object.defineProperty(exports, "VideoPlayer", {
  enumerable: true,
  get: function get() {
    return _player["default"];
  }
});
Object.defineProperty(exports, "addClickHandler", {
  enumerable: true,
  get: function get() {
    return _globalPlayer.addClickHandler;
  }
});
Object.defineProperty(exports, "playerTechDetection", {
  enumerable: true,
  get: function get() {
    return _techDetection["default"];
  }
});
Object.defineProperty(exports, "selectPlayerTech", {
  enumerable: true,
  get: function get() {
    return _selectTech["default"];
  }
});

var _player = _interopRequireDefault(require("./player"));

var _globalPlayer = _interopRequireWildcard(require("./globalPlayer"));

var _imaLoader = _interopRequireDefault(require("./imaLoader"));

var _techDetection = _interopRequireDefault(require("./lib/techDetection"));

var _selectTech = _interopRequireDefault(require("./lib/selectTech"));

var _errorCodes = _interopRequireDefault(require("./errorCodes"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }