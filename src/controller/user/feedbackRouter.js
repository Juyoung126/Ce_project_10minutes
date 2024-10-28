const express = require('express');
const mysql = require('mysql');
const verifyToken = require('./verifyToken');

const app = express();
app.use(express.json());

const pool = mysql.createPool({
  host: 'localhost',
  port: 3306,
  user: 'dbid232',
  password: 'dbpass232',
  database: 'db23201'
});

module.exports = {
  feedback: function (req, res) {
    // 토큰 확인
    verifyToken(req, res, () => {
      // 입력 유효성 검사
      const { star, classNum } = req.body;
  console.log('Received rating:', star, 'for class number:', classNum);
      // const star = req.body.star;
      // const classNum = req.body.classNum;
      // console.log(req.body);
      // console.log('star: ', star, '\n class_num:' ,classNum );
      if (!star || !classNum) {
        return res.status(400).json({ error: '잘못된 입력입니다. star, classNum을 모두 제공해주세요.' });
      }

      const sql = 'UPDATE classification SET feedback= ?, feed_star = ? WHERE class_num = ?';

      // 데이터베이스 쿼리
      pool.query(sql, ['Y', star, classNum], (err, result) => {
        if (err) {
          console.error('쿼리 오류:', err);
          return res.status(500).json({ error: '요청 처리에 실패했습니다.' });
        }

        if (result.affectedRows === 0) {
          return res.status(404).json({ error: '일치하는 분류 기록을 찾을 수 없습니다.' });
        }

        console.log('피드백이 성공적으로 저장되었습니다!');
        return res.json({ success: true });
      });
    });
  }
};
