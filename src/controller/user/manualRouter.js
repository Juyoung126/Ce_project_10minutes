const express = require('express');
var mysql = require('mysql');

const app = express();
app.use(express.json());

var pool = mysql.createPool({
    host: 'localhost',  // 데이터베이스 서버가 있는 주소.
    port: 3306,
    user: 'dbid232',     // 데이터베이스에 접근하기 위한 ID
    password: 'dbpass232',     // 데이터베이스에 접근하기 위한 Password
    database: 'db23201'   // 접근하고자 하는 데이터베이스 이름
});
module.exports = {
    manual: function (req, res) {
        try {
            // 매뉴얼 정보를 가져오는 SQL 쿼리
            const sql = 'SELECT * FROM manual';
            console.log("THIS is in Manual function (before pool db)"); // 동작 확인용 콘솔
            pool.query(sql, (error, manualData) => {
                if (error) {
                    console.error('데이터베이스 오류: ', error);
                    res.status(500).json({ error: '데이터를 가져오는 중 오류가 발생했습니다.' });
                }

                if (manualData.length === 0) {
                    console.log('매뉴얼이 없습니다.');
                    res.status(404).json({ error: 'manual not found' }); // 매뉴얼 데이터가 없음
                } else{
                    console.log('매뉴얼 목록 불러오기 성공')
                    res.json(manualData);

                }
                
            });
        } catch (error) {
            console.error('오류 발생:', error);
            res.status(500).json({ error: 'fail' });
        }
    },
    manualDetail: function (req, res) {
        const manualNum = req.params.manual_num;
        try {
            const sql = 'SELECT * FROM manual where manual_num = ? ';
            pool.query(sql, manualNum, (error, rows) => {
                if (error) {
                    console.error('데이터베이스 오류: ', error);
                    return res.status(500).json({ error: '데이터를 가져오는 중 오류가 발생했습니다.' });
                }
                if (rows.length === 0) {
                    console.error('매뉴얼이 존재하지 않습니다.');
                    return res.status(404).json({ error: 'fail: not found' });
                } else {
                    const manualData = rows[0];
                    console.log('Success to load manual List!');
                    return res.json(manualData);
                }
            })
        } catch (error) {
            console.error('오류 발생:', error);
            res.status(500).json({ error: 'fail' });
        }
    }
}