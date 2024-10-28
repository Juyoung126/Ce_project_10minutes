const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const db = require('./db');
const bcrypt = require('bcrypt');
const { createSecretKey } = require('crypto');
const e = require('cors');
const saltRounds = 10;  // 해싱에 사용. 보안을 높여주기 위해서? 비교를 위해서...
const getMimeType = require('./getMimeType.js');

// Google Maps API
const axios = require('axios');


app.use(express.json());
// app.use(express.static(path.join(__dirname, '/../view/web/build', 'utf8')));
app.use(bodyParser.urlencoded({ extended: false }));


module.exports = {

  // =======================================================================
  // <--------------------- 쓰레기통 위치 데이터 관리 ----------------------->
  // =======================================================================
  // GET 'trashcan location List'   (쓰레기통 위치 리스트 화면)
  trashcanList: function (req, res) {
    console.log('(in adminControl.js)   [GET]  Trashcan Location List  ');

    db.query(`SELECT trashcan_num, town_num, town, SUM(CASE WHEN types = '일반쓰레기' THEN 1 ELSE 0 END) AS countGeneral,
    SUM(CASE WHEN types = '재활용' THEN 1 ELSE 0 END) AS countRecycle, COUNT(*) AS countTown FROM trashcan
  GROUP BY town_num`, function (error, result) {
      if (error) {
        console.log("Error in DB Process  ::  Cannot SELECT from DB");
        res.status(500).json('Fail: DB ERROR. ');
      }

      // select NOTHING from DB   (DB에서 꺼내온 정보가 없음.) 
      if (result === undefined) {
        console.log("i got no information from manual table");
        res.status(404).json("I got nothing from manual table");
      }

      // DB에서 정상적으로 정보 받아옴
      else {
        const trashcan = result.map((row) => {

          return {
            id: row.trashcan_num,      // 쓰레기통 개별 번호
            town_num: row.town_num,     // 구 번호 (종로, 마포, ...)
            town: row.town,   // 구 이름
            countGeneral: row.countGeneral,   // 구 일반 쓰레기통 개수
            countRecycle: row.countRecycle,   // 구 재활용 쓰레기통 개수
            countTown: row.countTown,   // 구 전체 쓰레기통 개수
          };
        });

        console.log("This is in adminControl.js for Trashcan\n");
        console.log(trashcan);
        res.send(trashcan);    // 쓰레기통 위치 정보 전달
      }
    })
  },

  // GET 'trashcan Detail'  (쓰레기통 상세 화면 (자치구별))
  trashcanDetailPage: function (req, res) {
    console.log('(in adminControl.js)   [GET]  Trashcan Location Detail Page  ');
    const townNum = req.params.town_num;

    db.query(`SELECT * FROM trashcan WHERE town_num=?`, [townNum], function (error, result) {
      if (error) {
        console.log("Error in DB Process  ::  Cannot SELECT from DB");
        res.status(500).json('Fail: DB ERROR. ');
      }

      // select NOTHING from DB   (DB에서 꺼내온 정보가 없음.) 
      if (result === undefined) {
        console.log("i got no information from manual table");
        res.status(404).json("I got nothing from manual table");
      }

      // DB에서 정상적으로 정보 받아옴
      else {

        const trashcan = result.map((row) => {

          return {
            id: row.trashcan_num,      // 쓰레기통 개별 번호
            town_num: row.town_num,     // 구 번호 (종로, 마포, ...)
            town: row.town,   // 구 이름
            // street: row.street,
            st_address: row.st_address,
            detail: row.detail,
            placed: row.placed,
            types: row.types,
          };
        });

        console.log(trashcan);
        res.send(trashcan);    // 쓰레기통 위치 정보 전달
      }
    })
  },

  // GET 'trashcan location Create Page'   (쓰레기통 위치 등록 화면)
  newTrashcanPage: function (req, res) {
    console.log('(in adminControl.js)   [GET]  Trashcan Location List  ');
    res.status(200).json("Success : Here's the Create New Trashcan Location Page");
  },

  // POST 'trashcan location Create'   (쓰레기통 위치 등록 요청)
  newTrashcan: function (req, res) {
    console.log('(in adminControl.js)   [GET]  Trashcan Location List  ');

    const town = req.body.town;
    const street = req.body.street;
    const st_address = req.body.st_address;
    const detail = req.body.detail;
    const placed = req.body.placed;
    const types = req.body.types;

    //==========================================
    function processAddresses() {
      // if (index < results.length) {

      // Google API를 이용해 st_dress의 위성 좌표로 변환
      axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
        params: {
          address: st_address,
          key: 'AIzaSyCkfYbQ6_7_NWB4El6dJjicK-DSBhGXbIM'
        }
      })
        .then((response) => {
          const { lat, lng } = response.data.results[0].geometry.location;

          console.log("=======++============ lat: ", lat);
          console.log("=======++============ lng: ", lng);
          // town으로 town_num 구하기
          db.query(`SELECT town_num FROM trashcan WHERE town=?`, [town], function (error, result) {
            if (error) {
              console.log('Error: Cannot INSERT INTO DB - 1');
              return res.status(500).json('Fail: DB ERROR. ');
            }
            else {
              // console.log("==== +++ === (bf 2nd db) result: ", result);
              const townNum = result[0].town_num;
              console.log("==== +++ === (bf 2nd db) townNum: ", townNum);


              // town_num과 latitude, longitude 포함해서 삽입
              db.query(`INSERT INTO trashcan (town_num, town, street, st_address, detail, placed, types, latitude, longitude) VALUES (?, ?, ?, ?, ?,?, ?, ?, ?)`,
                [townNum, town, street, st_address, detail, placed, types, lat, lng], function (error2, result2) {
                  if (error2) {
                    console.log('Error: Cannot INSERT INTO DB - 2::\n', error2);
                    return res.status(500).json('Fail: DB ERROR. ');
                  }
                  else {
                    console.log('Success create new trashcan Location Information!!');
                    return res.status(200).json('Success create new trashcan Location Information!!');
                  }
                })
            }
          })

        })
        .catch((err) => {
          console.error('Error fetching data from Google Geocoding API: ', err);

          // 에러 발생 시 위도와 경도에 null 값으로 업데이트
          pool.query('UPDATE trashcan SET latitude = NULL, longitude = NULL WHERE trashcan_num = ?', [trashcan_num], (error, results, fields) => {
            if (error) throw error;
            console.log(`Set coordinates to null for address ${st_address}`);
            processAddresses(index + 1); // 다음 주소로 진행
          });
        });
    }

    // 위성좌표 변환 후 DB에 저장 실행!
    processAddresses();
  },

  // GET 'trashcan update page'   (쓰레기통 위치 수정 화면)
  trashcanUpdatePage: function (req, res) {
    console.log('(in adminControl.js)   [GET]  Trashcan Location Update Page  ');
    const townNum = req.params.town_num;
    const trashcanNum = req.params.trashcan_num;

    db.query(`SELECT * FROM trashcan WHERE trashcan_num=?`, [trashcanNum], function (error, result) {
      if (error) {
        console.log("Error in DB Process  ::  Cannot SELECT from DB");
        res.status(500).json('Fail: DB ERROR. ');
        return;
      }

      // select NOTHING from DB   (DB에서 꺼내온 정보가 없음.) 
      if (result[0] === undefined) {
        console.log("i got no information from manual table");
        res.status(404).json("I got nothing from manual table");
        return;
      }



      // DB에서 정상적으로 정보 받아옴
      else {
        console.log("result[0]: ", result[0]);

        const trashcan = {
          id: result[0].trashcan_num,
          town_num: result[0].town_num,
          town: result[0].town,
          street: result[0].street,
          st_address: result[0].st_address,
          detail: result[0].detail,
          placed: result[0].placed,
          types: result[0].types
        };

        console.log(trashcan);
        res.send(trashcan);    // 쓰레기통 위치 정보 전달
      }
    })
  },

  // PUT 'trashcan location Update'   (쓰레기통 위치 수정 요청)
  trashcanUpdate: function (req, res) {
    console.log('(in adminControl.js)   [PUT]  Trashcan Location  ');
    var trashcanNum = req.params.trashcan_num;

    const town = req.body.town;
    const street = req.body.street;
    const stAddress = req.body.stAddress;
    const detail = req.body.detail;
    const placed = req.body.placed;
    const types = req.body.types;

    db.query(`SELECT * FROM trashcan WHERE town=?`, [town], function (error, result) {
      if (error) {
        console.log('Error: Cannot INSERT INTO DB');
        return res.status(500).json('Fail: DB ERROR. ');
      }
      console.log("==== +++ === (bf 2nd db) result: ", result);
      const townNum = result[0].town_num;
      console.log("==== +++ === (bf 2nd db) townNum: ", townNum);
      // 받아온 정보 DB에 UPDATE
      db.query(`UPDATE trashcan SET town_num=?, town=?, street=?, st_address=?, detail=?, placed=?, types=? WHERE trashcan_num=?`,
        [townNum, town, street, stAddress, detail, placed, types, trashcanNum], function (error, result) {
          if (error) {
            console.log('DB 오류: ', error);
            return res.status(500).json('Fail: UPDATE Trashcan Locatiobn Information  ::  Admin - DB');
          }
          else {
            console.log("Success UPDATE a Trashcan Locatiobn !!");
            return res.status(200).json('Success: Trashcan Update :: Update DB information SUCCESSFULLY!!!');
          }
        })
    })
  },

  // DELETE 'trashcan location Delete'   (쓰레기통 위치 삭제 요청)
  trashcanDelete: function (req, res) {
    console.log('(in adminControl.js)   [DELETE]  Trashcan Location  ');
    var trashcanNum = req.params.trashcan_num;

    db.query('DELETE FROM trashcan WHERE trashcan_num=?', [trashcanNum], function (error, result) {
      if (error) {
        console.log('DB 오류: '.error);
        return res.status(500).json('Fail: DELETE Trashcan Location  ::  Admin - DB');
      }
      else {
        console.log("Success DELETE a Trashcan Location!!");
        return res.status(200).json('Success: DELETE Trashcan Location  ::  DELETE DB information SUCCESSFULLY!!!');
      }
    });
  },
}