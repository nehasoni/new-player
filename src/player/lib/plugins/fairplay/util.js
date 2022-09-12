'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.arrayToString = arrayToString;
exports.base64DecodeUint8Array = base64DecodeUint8Array;
exports.base64EncodeUint8Array = base64EncodeUint8Array;
exports.getHostnameFromURI = getHostnameFromURI;
exports.stringToArray = stringToArray;
function arrayToString(array) {
  var uint16array = new Uint16Array(array.buffer);
  let uri = String.fromCharCode.apply(null, uint16array);
  return uri;
}

function base64DecodeUint8Array(input) {
  var raw = atob(input);

  var rawLength = raw.length;

  var array = new Uint8Array(new ArrayBuffer(rawLength));

  for (var i = 0; i < rawLength; i++) {
    array[i] = raw.charCodeAt(i);
  }

  return array;
}

function base64EncodeUint8Array(input) {
  var keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  var chr1 = void 0;
  var chr2 = void 0;
  var chr3 = void 0;
  var enc1 = void 0;
  var enc2 = void 0;
  var enc3 = void 0;
  var enc4 = void 0;
  var i = 0;
  var output = '';

  while (i < input.length) {
    chr1 = input[i++];
    chr2 = i < input.length ? input[i++] : Number.NaN; // Not sure if the index
    chr3 = i < input.length ? input[i++] : Number.NaN; // checks are needed here

    enc1 = chr1 >> 2;
    enc2 = (chr1 & 3) << 4 | chr2 >> 4;
    enc3 = (chr2 & 15) << 2 | chr3 >> 6;
    enc4 = chr3 & 63;

    if (isNaN(chr2)) {
      enc3 = enc4 = 64;
    } else if (isNaN(chr3)) {
      enc4 = 64;
    }

    output += keyStr.charAt(enc1) + keyStr.charAt(enc2) + keyStr.charAt(enc3) + keyStr.charAt(enc4);
  }

  return output;
}

function getHostnameFromURI(uri) {
  let nameArr = uri && uri.split("skd://")
  return nameArr && nameArr[nameArr.length - 1]
}

function stringToArray(string) {
  var length = string.length;

  // 2 bytes for each char
  var buffer = new ArrayBuffer(length * 2);

  var array = new Uint16Array(buffer);

  for (var i = 0; i < length; i++) {
    array[i] = string.charCodeAt(i);
  }

  return array;
}