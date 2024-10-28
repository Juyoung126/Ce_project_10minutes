// const express = require('express');
// const mysql = require('mysql');
// const { verify } = require('jsonwebtoken');
// const verifyToken = require('./verifyToken');

// const app = express();
// app.use(express.json());

// const pool = mysql.createPool({
//     host: 'localhost',
//     port: 3306,
//     user: 'dbid232',
//     password: 'dbpass232',
//     database: 'db23201'
// });

// function calculateDistance(lat1, lon1, lat2, lon2) {
//     const R = 6371; // 지구의 반지름 (단위: km)
//     const dLat = deg2rad(lat2 - lat1);
//     const dLon = deg2rad(lon2 - lon1);
//     const a =
//         Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//         Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
//         Math.sin(dLon / 2) * Math.sin(dLon / 2);
//     const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//     const distance = R * c; // 두 지점 간의 거리 (단위: km)
//     return distance;
// }

// function deg2rad(deg) {
//     return deg * (Math.PI / 180);
// }

// module.exports = {
//     trashcan: function(req, res){
//         verifyToken(req, res, async () => {
//             const latitude = req.body.latitude;
//             const longitude = req.body.longitude;
//             console.log('+++++++++++++++++++++++++++++++++++++++latitude: ',latitude, '\n longitude: ', longitude)
//             try {
//                 const sql = 'SELECT st_address, detail, placed, latitude, longitude FROM trashcan';
//                 pool.query(sql, async (error, trashcanData) => {
//                     if (error) {
//                         console.error('데이터베이스 오류: ', error);
//                         res.status(500).json({ error: '데이터를 가져오는 중 오류가 발생했습니다.' });
//                     }
        
//                     if (trashcanData.length === 0) {
//                         console.log('공공쓰레기통 정보가 없습니다.');
//                         res.status(404).json({ error: 'trashcan not found' });
//                     } else {
//                         const trashcanInfo = [];
//                         for (const trashcan of trashcanData) {
//                             try {
//                                 const distance = calculateDistance(
//                                     latitude,
//                                     longitude,
//                                     trashcan.latitude,
//                                     trashcan.longitude
//                                 );
        
//                                 if (distance <= 5.0) {
//                                     trashcanInfo.push(trashcan);
//                                 }
//                             } catch (error) {
//                                 console.error('거리 계산 오류:', error);
//                             }
//                         }
        
//                         res.json(trashcanInfo);
//                     }
//                 });
//             } catch (error) {
//                 console.error('오류 발생:', error);
//                 res.status(500).json({ error: 'fail' });
//             }
    
//         })
//     }
// }

const express = require('express');
const mysql = require('mysql');
const { verify } = require('jsonwebtoken');
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
    trashcan: function(req, res){
        verifyToken(req, res, async () => {
            try {
                const sql = 'SELECT st_address, detail, placed, latitude, longitude, types FROM trashcan';
                pool.query(sql, async (error, trashcanData) => {
                    if (error) {
                        console.error('데이터베이스 오류: ', error);
                        res.status(500).json({ error: '데이터를 가져오는 중 오류가 발생했습니다.' });
                    }
        
                    if (trashcanData.length === 0) {
                        console.log('공공쓰레기통 정보가 없습니다.');
                        res.status(404).json({ error: 'trashcan not found' });
                    } else {
                        console.log('공공쓰레기통 보내기 성공');
                        res.json(trashcanData);
                    }
                });
            } catch (error) {
                console.error('오류 발생:', error);
                res.status(500).json({ error: 'fail' });
            }
    
        })
    }
}

// const express = require('express');
// var mysql = require('mysql');

// const app = express();
// app.use(express.json());

// var pool = mysql.createPool({
//     host: 'localhost',  // 데이터베이스 서버가 있는 주소.
//     port: 3306,
//     user: 'dbid232',     // 데이터베이스에 접근하기 위한 ID
//     password: 'dbpass232',     // 데이터베이스에 접근하기 위한 Password
//     database: 'db23201'   // 접근하고자 하는 데이터베이스 이름
// });
// module.exports = {
//     trashcan: function (req, res) {
//         try {
//             // 매뉴얼 정보를 가져오는 SQL 쿼리
//             const sql = 'SELECT * FROM trashcan';
//             console.log("THIS is in trashcan function (before pool db)"); // 동작 확인용 콘솔
//             pool.query(sql, (error, trashcanData) => {
//                 if (error) {
//                     console.error('데이터베이스 오류: ', error);
//                     res.status(500).json({ error: '데이터를 가져오는 중 오류가 발생했습니다.' });
//                 }

//                 if (trashcanData.length === 0) {
//                     console.log('공공쓰레기통 정보가 없습니다.');
//                     res.status(404).json({ error: 'trashcan not found' }); // 매뉴얼 데이터가 없음
//                 } else{
//                     console.log('공공쓰레기통 정보 불러오기 성공')
//                     res.json(trashcanData);

//                 }
                
//             });
//         } catch (error) {
//             console.error('오류 발생:', error);
//             res.status(500).json({ error: 'fail' });
//         }
//     }
// }