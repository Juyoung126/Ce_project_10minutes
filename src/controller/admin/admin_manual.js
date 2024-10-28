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


app.use(express.json());
// app.use(express.static(path.join(__dirname, '/../view/web/build', 'utf8')));
app.use(bodyParser.urlencoded({ extended: false }));




module.exports = {

  // =======================================================================
  // <-----------------  -- 분리배출 매뉴얼 데이터 관리 ---------------------->
  // =======================================================================
  // GET 'manual list'  (매뉴얼 리스트)
  manualList: function (req, res) {
    console.log("[GET]  Manual List Page  in adminDB.js");

    // db에서 매뉴얼 정보 추출
    //   -> 매뉴얼 번호, 대분로, 소분류
    db.query(`SELECT manual_num, types, title FROM manual`, function (error, result) {
      // error 발생
      if (error) {
        console.log('DB 오류: '.error);
        res.status(500).json('Fail: GET Manual Information  ::  Admin - DB');
      }

      // DB에 저장된 정보가 없음
      if (result === undefined) {
        console.log("i got no information from manual table");
        res.status(404).json("I got nothing from manual table");
      }
      // DB에서 정상적으로 정보 받아옴
      else {
        const manuals = result.map((row) => {
          return {
            id: row.manual_num,
            types: row.types,
            title: row.title,
          };
        });

        console.log(manuals);
        res.send(manuals);    // 매뉴얼 정보 전달
      }
    })
  },

  // GET 'new manual page'  (매뉴얼 등록 화면)
  newManualPage: function (req, res) {
    console.log('(in adminDB.js) [GET] newManualPage');
    res.status(200).json("Here's the Create New Manual Page");
  },

  // POST 'new manual'  (매뉴얼 등록 요청)
  newManual: function (req, res) {
    console.log('(in adminDB.js) [POST] newManual');

    const types = req.body.types;
    const title = req.body.title;
    const content = req.body.content;

    db.query(`INSERT INTO manual (types, title, content) VALUES(?, ?, ?)`,
      [types, title, content], function (error, result) {
        if (error) {
          console.log('DB 오류:', error);
          res.status(500).json('Fail: Create New MANUAL  ::  <Server Error> DB - while PUT NEW MANUAL');
        }
        console.log('Success create new manual!!');
        res.status(200).json('Success create new manual!!');
      }
    )
  },

  // GET 'manual deail page for manual_num'  (매뉴얼 상세페이지 화면)
  manualDetailPage: function (req, res) {
    console.log('(in adminDB.js) [GET] manualDetailPage');

    var manualNum = req.params.manual_num;

    // db에서 매뉴얼 정보 추출
    //   -> 매뉴얼 번호, 대분로, 소분류, 상세정보
    db.query(`SELECT * FROM manual WHERE manual_num = ?`,
      [manualNum], function (error, result) {
        // error 발생
        if (error) {
          console.log('DB 오류: '.error);
          res.status(500).json('Fail: GET Manual Information  ::  Admin - DB');
        }

        // DB에 저장된 정보가 없음
        if (result[0] === undefined) {
          console.log("i got no information from manual table");
          res.status(404).json("I got nothing from manual table");
        }
        // DB에서 정상적으로 정보 받아옴
        else {

          const manual = {
            id: result[0].manual_num,
            types: result[0].types,
            title: result[0].title,
            content: result[0].content,
            eligible_item: result[0].eligible_item,
            ineligible_item: result[0].ineligible_item
          };

          console.log(manual);
          res.send(manual);    // 매뉴얼 정보 전달
        }
      })
  },

  // GET 'manual deail update page for manual_num'  (매뉴얼 상세페이지 수정 화면)
  manualDetailEditPage: function (req, res) {
    console.log('(in adminDB.js) [GET]  manualDetailEditPage');
    var manualNum = req.params.manual_num;

    console.log("===== manualNum: ", manualNum);

    // db에서 매뉴얼 정보 추출
    //   -> 매뉴얼 번호, 대분로, 소분류, 상세정보
    db.query(`SELECT * FROM manual WHERE manual_num = ?`,
      [manualNum], function (error, result) {
        // error 발생
        if (error) {
          console.log('DB 오류: '.error);
          res.status(500).json('Fail: GET Manual Information  ::  Admin - DB');
        }

        // DB에 저장된 정보가 없음
        if (result[0] === undefined) {
          console.log("i got no information from manual table");
          res.status(404).json("I got nothing from manual table");
        }

        // Success to Select Informaion
        else {
          const manual = {
            id: result[0].manual_num,
            types: result[0].types,
            title: result[0].title,
            content: result[0].content,
            eligible_item: result[0].eligible_item,
            ineligible_item: result[0].ineligible_item
          };

          console.log(manual);
          res.send(manual);    // 문의 디테일 정보 전달
        }
      })
  },

  // PUT 'manual deail update for manual_num'  (매뉴얼 상세페이지 수정 요청)
  manualDetailEdit: function (req, res) {
    console.log('(in adminDB.js) [PUT] manualDetailEdit');
    var manualNum = req.params.manual_num;

    const types = req.body.types;
    const title = req.body.title;
    const content = req.body.content;

    // 받아온 정보 DB에 UPDATE
    db.query('UPDATE manual SET types=?, title=?, content=? WHERE manual_num=?',
      [types, title, content, manualNum], function (error, result) {
        if (error) {
          console.log('DB 오류: '.error);
          res.status(500).json('Fail: UPDATE Manual Information  ::  Admin - DB');
        }
        else {
          console.log("Success UPDATE a manual detail information!!");
          res.status(200).json('Success: manualDetailEdit :: Update DB information SUCCESSFULLY!!!');
        }
      }
    )
  },

  // DELETE 'manual deail delete for manual_num'  (매뉴얼 상세페이지 삭제 요청)
  manualDetailDelete: function (req, res) {
    console.log('(in adminDB.js)[DELETE] manualDetailDelete ');
    var manualNum = req.params.manual_num;

    console.log("-- manualNum: ", manualNum);
    db.query('DELETE FROM manual WHERE manual_num=?', [manualNum], function (error, result) {
      if (error) {
        console.log('DB 오류: ', error);
        res.status(500).json('Fail: DELETE Manual Information  ::  Admin - DB');
      }
      else {
        console.log("Success DELETE a manual detail information!!");
        res.status(200).json('Success: manualDetailEdit  ::  DELETE DB information SUCCESSFULLY!!!');
      }
    });
  },
}