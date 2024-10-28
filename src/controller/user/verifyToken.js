const jwt = require('jsonwebtoken');
const secretKey = '92d9eac1e1242e2c77e93636b1786cebdeb671fd2a3ba9d6070c6a2c51e0146c';

function verifyToken(req, res, next) {
  // 클라이언트로부터 헤더를 통해 토큰을 얻습니다.
  const tokenWithQuotes = req.headers.authorization;
  const token = tokenWithQuotes.replace(/"/g, ''); // 이중 인용부호 제거
  console.log('Received Token:', token);
  const currentTime = new Date();
  console.log('currentTime(verifyToken): ',currentTime);

  if (token) {
    jwt.verify(token, secretKey, (err, decoded) => {
      if (err) {
        // 토큰이 유효하지 않을 때 처리
        console.log()
        return res.status(401).json({ error: '토큰이 유효하지 않습니다.' });
      } else {
        // 토큰이 유효할 때, 사용자 정보를 req.user에 저장
        console.log('토큰 유효')
        req.user = decoded.user;
        next();
      }
    });
  } else {
    res.status(401).json({ error: '인증 토큰이 필요합니다.' }); // == 로그인이 필요!!
  }
}

module.exports = verifyToken;
