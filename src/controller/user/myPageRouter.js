const express = require('express');
const bcrypt = require('bcrypt');

const verifyToken = require('./verifyToken');
var mysql = require('mysql');

const saltRounds = 10;  //보안을 높여주기 위해서? 비교를 위해서...
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
    // 사용자 마이페이지 요청
    mypage: function (req, res) {
        verifyToken(req, res, () => {
            try {
                // 사용자 토큰을 확인하고, 유효하면 다음 단계로 진행
                const sql = 'SELECT user_num FROM user WHERE id = ?';
    
                pool.query(sql, req.user.id, (err, userData) => {
                    if (err) {
                        // 데이터베이스 오류 처리
                        console.error('데이터베이스 오류', err);
                        return res.status(500).json({ error: 'fail: database error' });
                    }
    
                    if (userData.length === 0) {
                        // 사용자를 찾을 수 없음
                        console.log('사용자를 찾을 수 없습니다.')
                        return res.status(404).json({ error: 'fail: user not found' });
                    }
                    const user = userData[0].user_num;
                    const sql2 = `
                        SELECT 
                            SUM(types_count) AS Total, 
                            SUM(Cardboard) AS Cardboard_Total,  
                            SUM(Plastic_Etc) AS Plastic_Etc_Total,
                            SUM(Vinyl) AS Vinyl_Total,
                            SUM(Styrofoam) AS Styrofoam_Total,
                            SUM(Glass) AS Glass_Total,
                            SUM(Beverage_Can) AS Beverage_Can_Total,
                            SUM(Canned) AS Canned_Total,
                            SUM(Metal) AS Metal_Total,
                            SUM(Paperboard) AS Paperboard_Total,
                            SUM(Booklets) AS Booklets_Total,
                            SUM(Carton) AS Carton_Total,
                            SUM(Paper_Etc) AS Paper_Etc_Total,
                            SUM(Plastic_Container) AS Plastic_Container_Total,
                            SUM(Clear_PET) AS Clear_PET_Total,
                            SUM(Colored_PET) AS Colored_PET_Total,
                            SUM(Packaging_Plastic) AS Packaging_Plastic_Total
                        FROM classification WHERE user_num = ?`;
    
                    pool.query(sql2, [user], (err, userMyData) => {
                        if (err) {
                            // 데이터베이스 오류 처리
                            console.error('데이터베이스 오류', err);
                            return res.status(500).json({ error: 'fail: database error' });
                        }
                        if (userMyData.length === 0) {
                            // 이전 결과가 없음
                            console.log('이전 결과가 없습니다.');
                            return res.status(404).json({ result: 'no history' });
                            //만약 status 가 404로 왔다면 result 값이 'no history'로 왔는지 확인 한 후
                            //그래프 값에 다 0 을 넣도록 하면 됩니다!!!
                        }
                        const userMypage = userMyData[0]; //사용자 분리수거 기록 데이터
                        res.json(userMypage);
                    });
                });
            } catch (error) {
                // 코드 실행 중 오류 처리
                console.error('오류 발생', error);
                res.status(500).json({ error: '요청을 처리하는 중 오류가 발생했습니다.' });
            }
        });
    },

    // 사용자 개인정보페이지 요청
    userinfo: function(req, res){
        verifyToken(req, res, () =>{
            console.log('user id: ',req.user.id);
            try {
                const sql = 'SELECT name, nickname, id, birth, email FROM user WHERE id = ?'
                pool.query(sql, req.user.id, (err, userData) => {
                    if (err) {
                        console.error('데이터베이스 오류:', err);
                        res.status(500).json({ error: '데이터를 가져오는 중 오류가 발생했습니다.' });
                    } else{
                        if (userData.length === 0) {
                            console.error('사용자가 존재 하지 않습니다. error :', err);
                            res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
                        }else{
                            const user = userData[0];
                            res.json(user);
                        }
                    }
                });
            } catch (error) {
                console.error('오류 발생:', error);
                res.status(500).json({ error: '요청을 처리하는 중 오류가 발생했습니다.' });
            }
            
        })
    },

    // 사용자 본인인증 확인 요청 
    passwdAuth: function(req, res) {
        verifyToken(req, res, () => {
            const id = req.user.id;
            const inputpasswd = req.body.passwd;
            const sql = 'SELECT passwd FROM user WHERE id = ?';
            console.log('id: ', id);
            console.log('inputpasswd: ',inputpasswd);
            pool.query(sql, [id], (err, rows) => {
                if (err) {
                    console.error('query 오류:', err);
                    res.status(500).json({ error: '데이터 불러오기 중 오류가 발생했습니다.' });
                }
    
                if (rows.length === 0) {
                    res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
                }
    
                const hashedPassword = rows[0].passwd;
                bcrypt.compare(inputpasswd, hashedPassword, (compareErr, isMatch) => {
                    if (compareErr) {
                        console.error('비밀번호 확인 중 오류 발생:', compareErr);
                        res.status(500).json({ error: '비밀번호 확인 중 오류가 발생했습니다.' });
                    }
    
                    if (isMatch) {
                        console.log('passwd is Match');
                        res.json({ success: true });
                    } else {
                        // 비밀번호 불일치 처리
                        console.log('passwd is no Match');
                        res.status(401).json({ error: '비밀번호가 일치하지 않습니다.' });
                    }
                });
            });
        });
    },
    
    //사용자 정보 수정 요청
    userinfoChange: function(req, res){
        verifyToken(req, res ,() => {
            const id = req.user.id;
            const nickname = req.body.changeReq.nickname;
            const email = req.body.changeReq.email;
            const password = req.body.changeReq.password;
            console.log('from user: ', password);
            if (password === null) {
                console.log('in if문');
                const sql = 'UPDATE user SET nickname =? , email = ? WHERE id = ?';
                pool.query(sql, [nickname, email, id], (updateErr, result) =>{
                    if(updateErr){
                        console.error('query 오류 :', updateErr);
                        res.status(500).json({ error: 'fail: database error' });
                    }else{
                        console.log('데이터 저장이 성공했습니다.');
                        res.json({ success: true });
                    }
                });
            } else{
                console.log('in else문');
                bcrypt.hash(password, saltRounds, (hashErr, hashedPassword) => {
                    if(hashErr){
                        console.error('비밀번호 암호화 중 오류 발생: ', hashErr);
                        res.status(500).json({ error: 'fail: hashing error' });
                    }
                    const updateData = {
                        u_id : id,
                        u_nickname : nickname,
                        u_email : email,
                        u_passwd : hashedPassword
                    };
                    const sql2 = 'UPDATE user SET nickname = ?, passwd =?, email = ? WHERE id = ?';
                    pool.query(sql2, [updateData.u_nickname, updateData.u_passwd, updateData.u_email, updateData.u_id],(error,result) =>{
                        if(error){
                            console.err('query 오류 :', error);
                            res.status(500).json({ error: '데이터 저장 중 오류가 발생했습니다.' });
                        }else{
                            console.log('데이터 저장이 성공했습니다.');
                            res.json({ success: true });                            
                        }
                    })
                })
            }
        })
    },
    //과거 분리수거 목록 페이지 요청
    pastHistoryList: function (req, res) {
        verifyToken(req, res,() => {
            const userId = req.user.id;
    
            // 사용자 번호 가져오기
            const userNumQuery = 'SELECT user_num FROM user WHERE id = ?';
            pool.query(userNumQuery, userId, async (userNumErr, userNumRows) => {
                if (userNumErr) {
                    console.log('사용자를 찾는 중 오류가 발생했습니다.', userNumErr);
                    return res.status(500).json({ error: 'fail: user search error' });
                }
    
                if (userNumRows.length === 0) {
                    console.log('사용자를 찾을 수 없습니다.');
                    return res.status(400).json({ error: 'fail: user not found' });
                }
    
                const userNum = userNumRows[0].user_num;
    
                // 과거 분리수거 기록 가져오기
                const historyQuery = `SELECT 
                                            class_num,date,types_count,Cardboard,Plastic_Etc,
                                            Vinyl,Styrofoam,Glass,Beverage_Can,Canned,
                                            Metal,Paperboard,Booklets,Carton,Paper_Etc,
                                            Plastic_Container,Clear_PET,Colored_PET,Packaging_Plastic
                                        FROM classification 
                                        WHERE user_num = ?`;
                pool.query(historyQuery, userNum, async (historyErr, historyRows) => {
                    if (historyErr) {
                        console.log('분류 기록을 가져오는 중 오류가 발생했습니다.', historyErr);
                        return res.status(500).json({ error: 'fail: history search error' });
                    }
    
                    if (historyRows.length === 0) {
                        console.log('이전 기록이 없습니다.');
                        return res.status(404).json({ result: 'no history' });
                    }
    
                    console.log('이전 분류 기록 불러오기 성공');
                    return res.json(historyRows);
                });
            });
        }, (error) => {
            console.log('데이터 검색 중 오류가 발생했습니다.', error);
            return res.status(500).json({ error: '데이터 검색 중 오류가 발생했습니다.' });
        });
    },

    pastHistory: function (req, res) {
        verifyToken(req, res, () => {
            const classNum = req.params.class_num;
            const userId = req.user.id;
    
            const userNumQuery = 'SELECT user_num FROM user WHERE id = ?';
            pool.query(userNumQuery, userId, (userNumErr, userNumRows) => {
                if (userNumErr || userNumRows.length === 0) {
                    console.log('사용자를 찾을 수 없습니다.');
                    return res.status(400).json({ error: 'fail: user not found' });
                }
    
                const userNum = userNumRows[0].user_num;
    
                const historyQuery = `SELECT * FROM classification WHERE user_num = ? AND class_num = ?`;
                pool.query(historyQuery, [userNum, classNum], (historyErr, historyRow) => {
                    if (historyErr || historyRow.length === 0) {
                        console.log('이전 기록이 없습니다.');
                        return res.status(404).json({ result: 'no history' });
                    }
                    const historyRows = historyRow.map((row)=>{
                        
                        const changeImg_bf = row.img_bf ? Buffer.from(row.img_bf).toString('base64') : null;
                        let changeClassified = null;
                        if (row.classified && Buffer.isBuffer(row.classified)) {
                            changeClassified = Buffer.from(row.classified).toString('base64');
                        }
                        return {
                            id: row.class_num,
                            user_num: row.user_num,
                            date: row.date,
                            img_bf: changeImg_bf,
                            classified: changeClassified,
                            types_count: row.types_count,
                            Cardboard: row.Cardboard,
                            Plastic_Etc: row.Plastic_Etc,
                            Vinyl: row.Vinyl,
                            Styrofoam: row.Styrofoam,
                            Glass: row.Glass,
                            Beverage_Can: row.Beverage_Can,
                            Canned: row.Canned,
                            Metal: row.Metal,
                            Paperboard: row.Paperboard,
                            Booklets: row.Booklets,
                            Carton: row.Carton,
                            Paper_Etc: row.Paper_Etc,
                            Plastic_Container: row.Plastic_Container,
                            Clear_PET: row.Clear_PET,
                            Colored_PET: row.Colored_PET,
                            Packaging_Plastic: row.Packaging_Plastic,
                            feedback: row.feedback,
                            feed_star: row.feed_star,
                        };
                    });
    
                    console.log('분류 기록 불러오기 성공');
                    res.send(historyRows);
                });
            });
        });
    }
    
    // pastHistory: function (req, res) {
    //     verifyToken(req, res, () => {
    //         const classNum = req.params.class_num;
    //         const userId = req.user.id;
    
    //         // 사용자 번호 가져오기
    //         const userNumQuery = 'SELECT user_num FROM user WHERE id = ?';
    //         pool.query(userNumQuery, userId, (userNumErr, userNumRows) => {
    //             if (userNumErr || userNumRows.length === 0) {
    //                 console.log('사용자를 찾을 수 없습니다.');
    //                 return res.status(400).json({ error: 'fail: user not found' });
    //             }
    
    //             const userNum = userNumRows[0].user_num;
    
    //             // 과거 분리수거 기록 가져오기
    //             const historyQuery = `SELECT * FROM classification WHERE user_num = ? AND class_num = ?`;
    //             pool.query(historyQuery, [userNum, classNum], (historyErr, historyRows) => {
    //                 if (historyErr || historyRows.length === 0) {
    //                     console.log('이전 기록이 없습니다.');
    //                     return res.status(404).json({ result: 'no history' });
    //                 }
    //                 const feedback = historyRows.map((row)=>{
                        
    //                     const changeImg_bf = row.img_bf ? Buffer.from(row.img_bf).toString('base64') : null;
    //                     const changeClassified = row.classified ? Buffer.from(row.classified).toString('base64') : null;

    //                     return {
    //                         id: row.class_num,
    //                         user_num: row.user_num,
    //                         date: row.date,
    //                         img_bf: changeImg_bf,
    //                         classified: changeClassified,
    //                         types_count: row.types_count,
    //                         Cardboard: row.Cardboard,
    //                         Plastic_Etc: row.Plastic_Etc,
    //                         Vinyl: row.Vinyl,
    //                         Styrofoam: row.Styrofoam,
    //                         Glass: row.Glass,
    //                         Beverage_Can: row.Beverage_Can,
    //                         Canned: row.Canned,
    //                         Metal: row.Metal,
    //                         Paperboard: row.Paperboard,
    //                         Booklets: row.Booklets,
    //                         Carton: row.Carton,
    //                         Paper_Etc: row.Paper_Etc,
    //                         Plastic_Container: row.Plastic_Container,
    //                         Clear_PET: row.Clear_PET,
    //                         Colored_PET: row.Colored_PET,
    //                         Packaging_Plastic: row.Packaging_Plastic,
    //                         feedback: row.feedback,
    //                         feed_star: row.feed_star,
    //                         feed_contents: row.feed_contents,
    //                     };
    //                 })
    //                 // // blob 데이터를 Base64로 변환
    //                 // const transformedHistoryRows = historyRows.map(row => {
    //                 //     if (row.image_bf) {
    //                 //         row.image_bf = Buffer.from(row.image_bf).toString('base64');
    //                 //     }
    //                 //     if (row.classification) {
    //                 //         row.classification = Buffer.from(row.classification).toString('base64');
    //                 //     }
    //                 //     return row;
    //                 // });
    
    //                 console.log('분류 기록 불러오기 성공');
    //                 res.send(feedback);
    //             });
    //         });
    //     });
    // }    
}
