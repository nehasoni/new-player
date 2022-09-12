'use strict';

var _util = require('./util');

module.exports = function concatInitDataIdAndCertificate(initData, id, certificate) {
  if (typeof id === 'string') {
    id = (0, _util.stringToArray)(id);
  }

  // Format:
  // [initData]
  // [4 byte: idLength]
  // [idLength byte: id]
  // [4 byte:certificateLength]
  // [certificateLength byte: certificate]

  var size = initData.byteLength + 4 + id.byteLength + 4 + certificate.byteLength;
  var offset = 0;

  var buffer = new ArrayBuffer(size);

  var dataView = new DataView(buffer);

  var initDataArray = new Uint8Array(buffer, offset, initData.byteLength);
  initDataArray.set(initData);
  offset += initDataArray.byteLength;

  dataView.setUint32(offset, id.byteLength, true);
  offset += 4;

  var idArray = new Uint16Array(buffer, offset, id.length);
  idArray.set(id);
  offset += idArray.byteLength;

  dataView.setUint32(offset, certificate.byteLength, true);
  offset += 4;

  var certificateArray = new Uint8Array(buffer, offset, certificate.byteLength);
  certificateArray.set(certificate);

  return new Uint8Array(buffer, 0, buffer.byteLength);
};