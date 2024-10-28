const path = require('path');

/**
 * 파일 확장자에 따라 MIME 타입을 반환하는 함수
 * @param {string} fileName - 파일 이름
 * @returns {string} - MIME 타입
 */
function getMimeType(fileName) {
  const ext = path.extname(fileName).toLowerCase();

  switch (ext) {
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.png':
      return 'image/png';
    case '.gif':
      return 'image/gif';
    case '.bmp':
      return 'image/bmp';
    case '.svg':
      return 'image/svg+xml';
    case '.webp':
      return 'image/webp';
    // 여기에 더 많은 확장자와 MIME 타입을 추가할 수 있습니다.
    default:
      return 'application/octet-stream'; // 알 수 없는 파일 형식
  }
}

module.exports = getMimeType;
