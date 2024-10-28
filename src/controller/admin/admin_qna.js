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
  // <------------------------- 사용자 문의 관리 --------------------------->
  // =======================================================================
  // GET 'QnA list'  (사용자 문의 리스트)
  qnaList: function (req, res) {
    console.log("[GET]  QnA List Page  in adminControl.js");

    // db에서 문의 리스트 추출
    db.query(`SELECT * FROM qna Q join user U on Q.user_num = U.user_num order by qna_num desc`, function (error, result) {
      // error 발생
      if (error) {
        console.log('DB 오류: '.error);
        res.status(500).json('Fail: GET QnA List  ::  Admin - DB');
      }

      // DB에 저장된 정보가 없음
      if (result === undefined) {
        console.log("i got no information from qna table");
        res.status(404).json("I got nothing from qna table");
      }
      // DB에서 정상적으로 정보 받아옴
      else {

        const qna = result.map((row) => {
          return {
            id: row.qna_num,
            user_id: row.id,
            date: row.date,
            category: row.category,
            title: row.title,
            replied: row.replied,
          };
        });

        console.log(qna);
        res.send(qna);    // 매뉴얼 정보 전달
      }
    })
  },

  // GET 'QnA deail page for QnA_num'  (사용자 문의 상세페이지 화면)
  qnaDetailPage: function (req, res) {
    console.log("[GET]  QnA Detail Page  in adminControl.js");
    console.log("req.params::", req.params);

    var qnaNum = req.params.qna_num;    // 요구한 상세 매뉴얼 번호 저장

    console.log('req.params.qna_num (in QnA Detail, from React): ', req.params.qna_num);
    console.log('qnaNum (in QnA Detail, from React): ', qnaNum);

    // db에서 문의 내용 추출  
    db.query(`SELECT * FROM qna Q join user U on Q.user_num = U.user_num 
    WHERE qna_num = ?`, [qnaNum], function (error, result) {
      // DB error
      if (error) {
        console.log('DB 오류: '.error);
        res.status(500).json('Fail: GET QnA Detail Information  ::  Admin - DB');
      }

      // Select Nothing
      if (result.length === 0) {
        console.log("i got no information from qna table");
        res.status(404).json("I got nothing from qna table");
      }

      // Success to Select Informaion
      else {
        console.log("====++++++===== result: ", result[0]);
        const qna = result.map((row) => {

          const changeImage = row.attached ? Buffer.from(row.attached).toString('base64') : null;
          // const changeClassified = row.classified ? Buffer.from(row.classified).toString('base64') : null;

          return {
            id: row.qna_num,
            user_num: row.user_num,
            user_id: row.id,
            date: row.date,
            category: row.category,
            title: row.title,
            contents: row.contents,
            attached: changeImage,
            replied: row.replied,
            reply: row.reply,
            admin_num: row.admin_num,
          };
        });
        console.log("\n>>> console.start ==================\n");    // 매뉴얼 정보 전달
        console.log(qna);    // 매뉴얼 정보 전달
        console.log("\n ================================================");    // 매뉴얼 정보 전달
        console.log(" ============================ console.finish <<<\n");    // 매뉴얼 정보 전달
        res.send(qna);    // 매뉴얼 정보 전달
      }
    })
  },

  // GET 'new QnA page'  (사용자 문의 답변 등록 화면)
  qnaReplyPage: function (req, res) {
    console.log('(in adminControl.js) [GET] newQnARePly');
    var qnaNum = req.params.qna_num;

    // db에서 문의 내용 추출  
    db.query(`SELECT * FROM qna Q join user U on Q.user_num = U.user_num 
    WHERE qna_num = ?`, [qnaNum], function (error, result) {

      // DB error
      if (error) {
        console.log('DB 오류: '.error);
        res.status(500).json('Fail: GET QnA Detail Information  ::  Admin - DB');
      }

      else {
        // Select Nothing
        if (result === undefined) {
          console.log("i got no information from qna table");
          res.status(404).json("I got nothing from qna table");
        }

        // Success to Select Informaion
        else {
          const changeImage = result[0].attached ? Buffer.from(result[0].attached).toString('base64') : null;

          const qna = {
            id: result[0].qna_num,
            user_num: result[0].user_num,
            user_id: result[0].user_id,
            date: result[0].date,
            category: result[0].category,
            title: result[0].title,
            contents: result[0].contents,
            attached: changeImage,
            replied: result[0].replied,
            reply: result[0].reply,
            admin_num: result[0].admin_num
          };

          console.log(qna);
          res.send(qna);    // 문의 디테일 정보 전달
        }
      }
    })
  },

  // PATCH 'new QnA'  (사용자 문의 답변 등록 요청)
  qnaReply: function (req, res) {
    console.log('(in adminControl.js) [PATCH] newQnAReply');

    var qnaNum = req.params.qna_num;    // parameter로 넘어온 qna num 저장
    var adminId = req.session.login_id;   // session에 저장된 관리자 id 저장
    const inputReply = req.body.reply;    // 괸리자가 작성한 답변 내용 저장
    const newReplied = 'Y';   // 답변 상태 Yes로 변경

    console.log("== >> == adminId ", adminId);
    console.log("== >> == inputReply ", inputReply);

    // session에 저장된 admin id로 답변을 다는 admin의 사번(admin_num) SELECT
    db.query(`SELECT admin_num FROM admin WHERE id=?`, [adminId], function (error, result) {
      if (error) {
        console.log('DB 오류:', error);
        res.status(500).json('Fail: Create New QnA Reply  ::  <Server Error> DB - while SELECT Admin Num');
      }
      else {
        var adminNum = result[0].admin_num;   // 관리자 사번 저장할 변수 선언

        console.log("(in 1st DB) adminNum: ", adminNum);

        db.query(`UPDATE qna SET replied=?, reply=?, admin_num=? WHERE qna_num=?`,
          [newReplied, inputReply, adminNum, qnaNum], function (error2, result2) {
            if (error2) {
              console.log('DB 오류:', error);
              res.status(500).json('Fail: Create New Reply  ::  <Server Error> DB - while PUT NEW MANUAL');
            }
            else {
              console.log('(in 2nd DB) result2: ', result2);
              console.log('Success create reply!!');
              res.status(200).json('Success create reply!!');
            }
          })
      }
    })
  },


  // PATCH 'QnA deail delete for QnA_num'  (사용자 문의 답변 삭제 요청)
  qnaReplyDelete: function (req, res) {
    console.log('(in adminDB.js)[DELETE] manualDetailDelete ');

    var qnaNum = req.params.qna_num;    // parameter로 넘어온 qna num 저장
    const deleteReply = null;    // 괸리자가 작성한 답변 내용 저장
    const deleteReplied = 'N';    // 답변 상태 변경
    const deleteAdminId = null;    // 괸리자가 작성한 답변 내용 저장


    // session에 저장된 admin id로 답변을 다는 admin의 사번(admin_num) SELECT
    db.query(`SELECT admin_num FROM admin WHERE id=?`, [adminId], function (error, result) {
      if (error) {
        console.log('DB 오류:', error);
        res.status(500).json('Fail: Create New QnA Reply  ::  <Server Error> DB - while SELECT Admin Num');
      }
      else {
        adminNum = result[0].admin_num;
      }
    })

    // qna table에 관리자가 작성한 답변 삭제 및 답변 상태 변경
    db.query(`UPDATE qna SET reply=?, replied=?, admin_num=? WHERE qna_num=?`,
      [deleteReply, deleteReplied, deleteAdminId, qnaNum], function (error, result) {
        if (error) {
          console.log('DB 오류: '.error);
          res.status(500).json('Fail: DELETE QnA Reply  ::  Admin - DB');
        }
        else {
          console.log("Success DELETE a QnA Reply!!");
          res.status(200).json('Success: DELETE QnA Reply  ::  DELETE DB information SUCCESSFULLY!!!');
        }
      });
  },
}