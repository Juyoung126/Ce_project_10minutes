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
    getMain: function (req, res) {
        verifyToken(req, res, () => {
            try {
                // 토큰 검증 미들웨어를 통해 사용자 정보를 가져옵니다
                const User = req.user;

                if (!User) {
                    return res.status(405).json({ error: '로그인이 필요합니다.' });
                }
                res.status(200).json({ success: true, message: '토큰이 유효합니다.' });
            } catch (error) {
                console.error('Response 오류:', error);
                res.status(500).json({ error: 'fail: response error' });
            }
        });
    }
    // getMain: function (req, res) {
    //     verifyToken(req, res, () => {
    //         try {
    //             // 토큰 검증 미들웨어를 통해 사용자 정보를 가져옵니다
    //             const User = req.user;

    //             if (!User) {
    //                 return res.status(405).json({ error: '로그인이 필요합니다.' });
    //             }
    //             const sql = 'SELECT user_num, bottlecap, point FROM user WHERE id = ?';
    //             pool.query(sql, User.id, (error, rows) => {
    //                 if (error) {
    //                     console.error('데이터베이스 오류: ', error);
    //                     return res.status(500).json({ error: 'fail: database error' });
    //                 }
    //                 const userMainData=rows[0]
    //                 res.json(userMainData);
                    
    //             });
    //         } catch (error) {
    //             console.error('Response 오류:', error);
    //             res.status(500).json({ error: 'fail: response error' });
    //         }
    //     });
    // }
};
