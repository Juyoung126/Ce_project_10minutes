const express = require('express');
var mysql = require('mysql');
const multer = require('multer');
const verifyToken = require('./verifyToken');
const bodyParser = require('body-parser');
const app = express();
const fs = require('fs');
app.use(express.json());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());



// 이미지 업로드를 위한 Multer 설정
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


var pool = mysql.createPool({
    host: 'localhost',  // 데이터베이스 서버가 있는 주소.
    port: 3306,
    user: 'dbid232',     // 데이터베이스에 접근하기 위한 ID
    password: 'dbpass232',     // 데이터베이스에 접근하기 위한 Password
    database: 'db23201'   // 접근하고자 하는 데이터베이c스 이름
});
module.exports = {
    qnaList: function (req, res) {
        verifyToken(req, res, () => {
            const userId = req.user.id;

            // 사용자 번호 가져오기
            const userNumQuery = 'SELECT user_num FROM user WHERE id = ?';
            pool.query(userNumQuery, userId, (userNumError, userNumRows) => {
                if (userNumError) {
                    console.error('데이터베이스 오류: ', userNumError);
                    return res.status(500).json({ error: 'fail: query error' });
                }

                if (userNumRows.length === 0) {
                    console.log('사용자 정보를 찾을 수 없습니다.');
                    return res.status(404).json({ error: 'User not found' });
                }

                const userNum = userNumRows[0].user_num;

                // 문의 목록 가져오기
                const qnaQuery = 'SELECT * FROM qna WHERE user_num = ?';
                pool.query(qnaQuery, userNum, (qnaError, qnaRows) => {
                    if (qnaError) {
                        console.error('쿼리오류: ', qnaError);
                        return res.status(500).json({ error: 'fail: query error' });
                    }

                    if (qnaRows.length === 0) {
                        console.log('문의 이력이 없습니다.');
                        return res.status(404).json({ error: 'No inquiries found' });
                    }

                    console.log('문의 목록을 불러왔습니다.');
                    return res.json(qnaRows);
                });
            });
        });
    },
    qnaDetail: function (req, res) {
        verifyToken(req, res, () => {
            const qnaNum = req.params.qna_num;
            const qnaQuery = 'SELECT * from qna WHERE qna_num = ?';

            pool.query(qnaQuery, qnaNum, (error, qnaRows) => {
                if (error) {
                    console.error('데이터베이스 오류: ', error);
                    return res.status(500).json({ error: '데이터를 가져오는 중 오류가 발생했습니다.' });
                }

                if (qnaRows.length === 0) {
                    console.log('문의 내용이 존재하지 않습니다.');
                    return res.status(404).json({ error: 'fail: not found' });
                } else {
                    const qnaData = qnaRows[0];
                    console.log('문의 내용 불러오기 성공');
                    return res.json(qnaData);
                }
            });
        });
    },
    qnaSubmit: function (req, res) {
        verifyToken(req, res, async () => {
            const userId = req.user.id;
            console.log('in qnaSubmit');
            
            const qnaForm = JSON.parse(req.body.qnaForm);
            const category = qnaForm.category;
            const title = qnaForm.title;
            const contents = qnaForm.contents;
            
            const attached = req.file; // 파일 정보를 attached에 할당
    
            console.log('category: ', category);
    
            const userNumQuery = 'SELECT user_num FROM user WHERE id = ?';
            pool.query(userNumQuery, userId, (userNumError, userNumRows) => {
                if (userNumError) {
                    console.error('데이터베이스 오류: ', userNumError);
                    return res.status(500).json({ error: 'fail: query error' });
                }
    
                if (userNumRows.length === 0) {
                    console.log('사용자 정보를 찾을 수 없습니다.');
                    return res.status(404).json({ error: 'User not found' });
                }
    
                const userNum = userNumRows[0].user_num;

                if(!attached){
                    // 이미지 파일을 Blob으로 변환하지 않고, 그대로 사용
                    const qnaInsertQuery = 'INSERT INTO qna (user_num, date, category, title, contents) VALUES (?, NOW(), ?, ?, ?)';
                    pool.query(qnaInsertQuery, [userNum, category, title, contents], (qnaInsertError, qnaInsertResult) => {
                        if (qnaInsertError) {
                            console.error('데이터베이스 오류: ', qnaInsertError);
                            return res.status(500).json({ error: '데이터를 가져오는 중 오류가 발생했습니다.1' });
                        } else {
                            console.log('Q&A 등록이 완료되었습니다.');
                            return res.json({ success: true });
                        }
                    });
                }
                else{
                    // 이미지 파일을 Blob으로 변환하지 않고, 그대로 사용
                    const qnaInsertQuery2 = 'INSERT INTO qna (user_num, date, category, title, contents, attached) VALUES (?, NOW(), ?, ?, ?, ?)';
                    pool.query(qnaInsertQuery2, [userNum, category, title, contents, attached.buffer], (qnaInsertError2, qnaInsertResult2) => {
                        if (qnaInsertError2) {
                            console.error('데이터베이스 오류: ', qnaInsertError2);
                            return res.status(500).json({ error: '데이터를 가져오는 중 오류가 발생했습니다.2' });
                        } else {
                            console.log('Q&A 등록이 완료되었습니다.');
                            return res.json({ success: true });
                        }
                    });
                }
                
            });
        });
    },
    upload: upload  // multer 인스턴스 내보내기    
}    