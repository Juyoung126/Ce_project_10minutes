const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const db = require('./db.js');
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
  // <---------------------------- 사용자 관리 ----------------------------->
  // =======================================================================
  // GET 'User List'   (사용자 리스트 화면)
  userList: function (req, res) {
    console.log('[GET] UserList for Admin   in adminControl.js');

    db.query(`SELECT user_num, name, nickname, id, email FROM user`, function (error, result) {
      // error 발생
      if (error) {
        console.log('DB 오류: '.error);
        res.status(500).json('Fail: GET USER LIST  ::  DB');
      }

      // DB에 저장된 정보가 없음
      if (result.length === 0) {
        console.log("i got no information from user table");
        res.status(404).json("I got nothing from user table");
      }
      else {

        const users = result.map((row) => {
          return {
            id: row.user_num,
            name: row.name,
            nickname: row.nickname,
            userId: row.id,
            email: row.email
          };
        });

        console.log(users);
        res.send(users);    // 매뉴얼 정보 전달
      }
    })
  },

  // GET 'User Detail'  (사용자 개인 화면)
  userDetail: function (req, res) {
    console.log('[GET] UserDetail for Admin   in adminControl.js');
    var userNum = req.params.user_num;


    console.log("userNum (in user detail part): ", userNum);
    db.query(`SELECT * FROM user WHERE user_num = ?`, [userNum], function (error, result) {
      // error 발생
      if (error) {
        console.log('DB 오류: '.error);
        res.status(500).json('Fail: GET USER LIST  ::  DB');
      }

      // DB로부터 저장된 정보가 없음
      if (result[0] === undefined) {
        console.log("i got no information from user table");
        res.status(404).json("I got nothing from user table");
      }

      else {
        db.query(`SELECT SUM(Cardboard) as sum1, SUM(Plastic_Etc) as sum2, SUM(Vinyl) as sum3, 
        SUM(Styrofoam) as sum4, SUM(Glass) as sum5, SUM(Beverage_Can) as sum6, 
        SUM(Canned) as sum7, SUM(Metal) as sum8, SUM(Paperboard) as sum9, SUM(Booklets) as sum10, SUM(Carton) as sum11, 
        SUM(Paper_Etc) as sum12, SUM(Plastic_Container) as sum13, SUM(Clear_PET) as sum14, SUM(Colored_PET) as sum15, 
        SUM(Packaging_Plastic) as sum16 FROM classification WHERE user_num = ?`, [userNum], function (error2, result2) {

          const users = {
            id: result[0].user_num,
            name: result[0].name,
            nickname: result[0].nickname,
            userId: result[0].id,
            birth: result[0].birth,
            email: result[0].email,
            cardboard: result2[0].sum1,
            plasticEtc: result2[0].sum2,
            vinyl: result2[0].sum3,
            styrofoam: result2[0].sum4,
            glass: result2[0].sum5,
            beverageCan: result2[0].sum6,
            canned: result2[0].sum7,
            metal: result2[0].sum8,
            paperboard: result2[0].sum9,
            booklets: result2[0].sum10,
            carton: result2[0].sum11,
            paperEtc: result2[0].sum12,
            plasticContainer: result2[0].sum13,
            clearPet: result2[0].sum14,
            coloredPet: result2[0].sum15,
            packagingPlastic: result2[0].sum16,
          };

          console.log(users);
          res.send(users);    // 매뉴얼 정보 전달
        })
      }
    })
  },

  // DELETE 'User Delete'    // (사용자 정보 삭제)
  userDelete: function (req, res) {
    console.log('[DELETE] UserDetail for Admin   in beginning.js');
    const userNum = req.params.user_num;

    db.query(`DELETE FROM user WHERE user_num=?`, [userNum], function (error, result) {
      if (error) {
        console.log('DB 오류: '.error);
        res.status(500).json('Fail: DELETE USER LIST  ::  DB');
      }

      else {
        console.log('SUCCESS: Delete User Information Successfully!!');
        res.status(200).json('SUCCESS: Delete User Information');
      }
    })
  },

  // GET 'User's Trash History'   (사용자 분리배출 기록)
  userTrash: function (req, res) {
    console.log("[GET] Personal User's Trash History for Admin   in adminControl.js");
    const userNum = req.params.user_num;

    // DB join
    db.query(`SELECT * FROM classification WHERE user_num=?`, [userNum], function (error, result) {
      if (error) {
        console.log('DB 오류: '.error);
        res.status(500).json("Fail: SELECT USER's Trash Histroy  ::  DB");
      }

      // DB로부터 저장된 정보가 없음
      if (result[0] === undefined) {
        console.log("i got no information from user table");
        res.status(404).json("I got nothing from user table");
      }

      else {
        const classification = result.map((row) => {
          const changeImg_bf = row.img_bf ? Buffer.from(row.img_bf).toString('base64') : null;
          const changeClassified = row.classified ? Buffer.from(row.classified).toString('base64') : null;

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
            ClearPET: row.ClearPET,
            ColoredPET: row.ColoredPET,
            Packaging_Plastic: row.Packaging_Plastic,
            feedback: row.feedback,
            feed_star: row.feed_star,
          };
        });

        console.log(classification);
        res.send(classification);    // 사용자 분리배출 기록 전달
      }
    })
  },


  // // =======================================================================
  // // <------------------------- 사용자 문의 관리 --------------------------->
  // // =======================================================================
  // // GET 'QnA list'  (사용자 문의 리스트)
  // qnaList: function (req, res) {
  //   console.log("[GET]  QnA List Page  in adminControl.js");

  //   // db에서 문의 리스트 추출
  //   db.query(`SELECT * FROM qna Q join user U on Q.user_num = U.user_num order by qna_num desc`, function (error, result) {
  //     // error 발생
  //     if (error) {
  //       console.log('DB 오류: '.error);
  //       res.status(500).json('Fail: GET QnA List  ::  Admin - DB');
  //     }

  //     // DB에 저장된 정보가 없음
  //     if (result === undefined) {
  //       console.log("i got no information from qna table");
  //       res.status(404).json("I got nothing from qna table");
  //     }
  //     // DB에서 정상적으로 정보 받아옴
  //     else {

  //       const qna = result.map((row) => {
  //         return {
  //           id: row.qna_num,
  //           user_id: row.id,
  //           date: row.date,
  //           category: row.category,
  //           title: row.title,
  //           replied: row.replied,
  //         };
  //       });

  //       console.log(qna);
  //       res.send(qna);    // 매뉴얼 정보 전달
  //     }
  //   })
  // },

  // // GET 'QnA deail page for QnA_num'  (사용자 문의 상세페이지 화면)
  // qnaDetailPage: function (req, res) {
  //   console.log("[GET]  QnA Detail Page  in adminControl.js");
  //   console.log("req.params::", req.params);

  //   var qnaNum = req.params.qna_num;    // 요구한 상세 매뉴얼 번호 저장

  //   console.log('req.params.qna_num (in QnA Detail, from React): ', req.params.qna_num);
  //   console.log('qnaNum (in QnA Detail, from React): ', qnaNum);

  //   // db에서 문의 내용 추출  
  //   db.query(`SELECT * FROM qna Q join user U on Q.user_num = U.user_num 
  //   WHERE qna_num = ?`, [qnaNum], function (error, result) {
  //     // DB error
  //     if (error) {
  //       console.log('DB 오류: '.error);
  //       res.status(500).json('Fail: GET QnA Detail Information  ::  Admin - DB');
  //     }

  //     // Select Nothing
  //     if (result.length === 0) {
  //       console.log("i got no information from qna table");
  //       res.status(404).json("I got nothing from qna table");
  //     }

  //     // Success to Select Informaion
  //     else {

  //       //////////////////////////////
  //       // AI 분류 결과 성공적으로 불러옴

  //       const qna = result.map((row) => {

  //         const changeImage = row.attached ? Buffer.from(row.attached).toString('base64') : null;
  //         // const changeClassified = row.classified ? Buffer.from(row.classified).toString('base64') : null;

  //         return {
  //           id: row.qna_num,
  //           user_num: row.user_num,
  //           user_id: row.user_id,
  //           date: row.date,
  //           category: row.category,
  //           title: row.title,
  //           contents: row.contents,
  //           attached: changeImage,
  //           replied: row.replied,
  //           reply: row.reply,
  //           admin_num: row.admin_num,
  //         };
  //       });
  //       console.log("\n>>> console.start ==================\n");    // 매뉴얼 정보 전달
  //       console.log(qna);    // 매뉴얼 정보 전달
  //       console.log("\n ================================================");    // 매뉴얼 정보 전달
  //       console.log(" ============================ console.finish <<<\n");    // 매뉴얼 정보 전달
  //       res.send(qna);    // 매뉴얼 정보 전달
  //       /////////////////////


  //       // const changeImage = result[0].attached ? Buffer.from(result[0].attached).toString('base64') : null;

  //       // const qna = {
  //       //   id: result[0].qna_num,
  //       //   user_num: result[0].user_num,
  //       //   user_id: result[0].user_id,
  //       //   date: result[0].date,
  //       //   category: result[0].category,
  //       //   title: result[0].title,
  //       //   contents: result[0].contents,
  //       //   attached: changeImage,
  //       //   replied: result[0].replied,
  //       //   reply: result[0].reply,
  //       //   admin_num: result[0].admin_num
  //       // };

  //       // console.log(qna);
  //       // res.send(qna);    // 문의 디테일 정보 전달
  //     }
  //   })
  // },

  // // GET 'new QnA page'  (사용자 문의 답변 등록 화면)
  // qnaReplyPage: function (req, res) {
  //   console.log('(in adminControl.js) [GET] newQnARePly');
  //   var qnaNum = req.params.qna_num;

  //   // db에서 문의 내용 추출  
  //   db.query(`SELECT * FROM qna Q join user U on Q.user_num = U.user_num 
  //   WHERE qna_num = ?`, [qnaNum], function (error, result) {

  //     // DB error
  //     if (error) {
  //       console.log('DB 오류: '.error);
  //       res.status(500).json('Fail: GET QnA Detail Information  ::  Admin - DB');
  //     }

  //     else {
  //       // Select Nothing
  //       if (result === undefined) {
  //         console.log("i got no information from qna table");
  //         res.status(404).json("I got nothing from qna table");
  //       }

  //       // Success to Select Informaion
  //       else {
  //         const changeImage = result[0].attached ? Buffer.from(result[0].attached).toString('base64') : null;

  //         const qna = {
  //           id: result[0].qna_num,
  //           user_num: result[0].user_num,
  //           user_id: result[0].user_id,
  //           date: result[0].date,
  //           category: result[0].category,
  //           title: result[0].title,
  //           contents: result[0].contents,
  //           attached: changeImage,
  //           replied: result[0].replied,
  //           reply: result[0].reply,
  //           admin_num: result[0].admin_num
  //         };

  //         console.log(qna);
  //         res.send(qna);    // 문의 디테일 정보 전달
  //       }
  //     }
  //   })
  // },

  // // PATCH 'new QnA'  (사용자 문의 답변 등록 요청)
  // qnaReply: function (req, res) {
  //   console.log('(in adminControl.js) [PATCH] newQnAReply');

  //   var qnaNum = req.params.qna_num;    // parameter로 넘어온 qna num 저장
  //   var adminId = req.session.login_id;   // session에 저장된 관리자 id 저장
  //   const inputReply = req.body.reply;    // 괸리자가 작성한 답변 내용 저장
  //   const newReplied = 'Y';   // 답변 상태 Yes로 변경
  //   // var adminNum = 0;   // 관리자 사번 저장할 변수 선언

  //   console.log("== >> == adminId ", adminId);
  //   console.log("== >> == inputReply ", inputReply);

  //   // session에 저장된 admin id로 답변을 다는 admin의 사번(admin_num) SELECT
  //   db.query(`SELECT admin_num FROM admin WHERE id=?`, [adminId], function (error, result) {
  //     if (error) {
  //       console.log('DB 오류:', error);
  //       res.status(500).json('Fail: Create New QnA Reply  ::  <Server Error> DB - while SELECT Admin Num');
  //     }
  //     else {
  //       var adminNum = result[0].admin_num;   // 관리자 사번 저장할 변수 선언

  //       console.log("(in 1st DB) adminNum: ", adminNum);

  //       db.query(`UPDATE qna SET replied=?, reply=?, admin_num=? WHERE qna_num=?`,
  //         [newReplied, inputReply, adminNum, qnaNum], function (error2, result2) {
  //           if (error2) {
  //             console.log('DB 오류:', error);
  //             res.status(500).json('Fail: Create New Reply  ::  <Server Error> DB - while PUT NEW MANUAL');
  //           }
  //           else {
  //             console.log('(in 2nd DB) result2: ', result2);
  //             console.log('Success create reply!!');
  //             res.status(200).json('Success create reply!!');
  //           }
  //         })
  //     }
  //   })
  // },

  // // // GET 'QnA deail update page for QnA_num'  (사용자 문의 답변 수정 화면)
  // // qnaReplyUpdatePage: function (req, res) {
  // //   console.log('(in adminDB.js) [GET]  QnA Update Page');
  // //   var qnaNum = req.params.qna_num;

  // //   // db에서 문의 내용 추출  
  // //   db.query(`SELECT Q.qna_num, Q.user_num, U.id, Q.date, Q.category, Q.title, Q.content, 
  // //  Q.attached, Q.reply FROM qna Q join user U on Q.user_num = U.user_num WHERE qna_num = ?`,
  // //     [qnaNum], function (error, result) {
  // //       // DB error
  // //       if (error) {
  // //         console.log('DB 오류: '.error);
  // //         res.status(500).json('Fail: GET QnA Detail Information  ::  Admin - DB');
  // //       }

  // //       // Select Nothing
  // //       if (result === undefined) {
  // //         console.log("i got no information from qna table");
  // //         res.status(404).json("I got nothing from qna table");
  // //       }

  // //       // Success to Select Informaion
  // //       else {

  // //         // Send informaion as a json type
  // //         const qna = result.map((row) => {
  // //           const changeImage = row.attached ? Buffer.from(row.attached).toString('base64') : null;

  // //           return {
  // //             id: row.qna_num,
  // //             user_num: row.user_num,
  // //             user_id: row.id,
  // //             date: row.date,
  // //             category: row.category,
  // //             title: row.title,
  // //             content: row.content,
  // //             attached: changeImage,
  // //             replied: row.replied,
  // //             reply: row.reply
  // //           };
  // //         });
  // //         console.log(qna);
  // //         res.send(qna);
  // //       }
  // //     })
  // // },

  // // // PATCH 'QnA deail update for QnA_num'  (사용자 문의 답변 수정 요청)
  // // qnaReplyUpdate: function (req, res) {
  // //   console.log('(in adminDB.js) [PUT] QnA Detail Update');

  // //   var qnaNum = req.params.qna_num;    // parameter로 넘어온 qna num 저장
  // //   var adminId = req.session.is_logined;   // session에 저장된 관리자 id 저장
  // //   const changedReply = req.body.reply;    // 괸리자가 작성한 답변 내용 저장
  // //   var adminNum = 0;   // 관리자 사번 저장할 변수 선언

  // //   // session에 저장된 admin id로 답변을 다는 admin의 사번(admin_num) SELECT
  // //   db.query(`SELECT admin_num FROM admin WHERE id=?`, [adminId], function (error, result) {
  // //     if (error) {
  // //       console.log('DB 오류:', error);
  // //       res.status(500).json('Fail: Create New QnA Reply  ::  <Server Error> DB - while SELECT Admin Num');
  // //     }
  // //     else {
  // //       adminNum = result[0].admin_num;
  // //     }
  // //   })

  // // // qna table에 관리자가 작성한 답변 저장 및 답변 상태 변경
  // // db.query(`UPDATE qna SET reply=?, admin_num=? WHERE qna_num=?`,
  // //   [changedReply, adminNum, qnaNum], function (error, result) {
  // //     if (error) {
  // //       console.log('DB 오류:', error);
  // //       res.status(500).json('Fail: Create New MANUAL  ::  <Server Error> DB - while PUT NEW MANUAL');
  // //     }
  // //     else {
  // //       console.log('Success create new manual!!');
  // //       res.status(200).json('Success create new manual!!');
  // //     }
  // //   })

  // // },

  // // PATCH 'QnA deail delete for QnA_num'  (사용자 문의 답변 삭제 요청)
  // qnaReplyDelete: function (req, res) {
  //   console.log('(in adminDB.js)[DELETE] manualDetailDelete ');

  //   var qnaNum = req.params.qna_num;    // parameter로 넘어온 qna num 저장
  //   const deleteReply = null;    // 괸리자가 작성한 답변 내용 저장
  //   const deleteReplied = 'N';    // 답변 상태 변경
  //   const deleteAdminId = null;    // 괸리자가 작성한 답변 내용 저장


  //   // session에 저장된 admin id로 답변을 다는 admin의 사번(admin_num) SELECT
  //   db.query(`SELECT admin_num FROM admin WHERE id=?`, [adminId], function (error, result) {
  //     if (error) {
  //       console.log('DB 오류:', error);
  //       res.status(500).json('Fail: Create New QnA Reply  ::  <Server Error> DB - while SELECT Admin Num');
  //     }
  //     else {
  //       adminNum = result[0].admin_num;
  //     }
  //   })

  //   // qna table에 관리자가 작성한 답변 삭제 및 답변 상태 변경
  //   db.query(`UPDATE qna SET reply=?, replied=?, admin_num=? WHERE qna_num=?`,
  //     [deleteReply, deleteReplied, deleteAdminId, qnaNum], function (error, result) {
  //       if (error) {
  //         console.log('DB 오류: '.error);
  //         res.status(500).json('Fail: DELETE QnA Reply  ::  Admin - DB');
  //       }
  //       else {
  //         console.log("Success DELETE a QnA Reply!!");
  //         res.status(200).json('Success: DELETE QnA Reply  ::  DELETE DB information SUCCESSFULLY!!!');
  //       }
  //     });
  // },

  // // =======================================================================
  // // <-----------------  -- 분리배출 매뉴얼 데이터 관리 ---------------------->
  // // =======================================================================
  // // GET 'manual list'  (매뉴얼 리스트)
  // manualList: function (req, res) {
  //   console.log("[GET]  Manual List Page  in adminDB.js");

  //   // db에서 매뉴얼 정보 추출
  //   //   -> 매뉴얼 번호, 대분로, 소분류
  //   db.query(`SELECT manual_num, types, title FROM manual`, function (error, result) {
  //     // error 발생
  //     if (error) {
  //       console.log('DB 오류: '.error);
  //       res.status(500).json('Fail: GET Manual Information  ::  Admin - DB');
  //     }

  //     // DB에 저장된 정보가 없음
  //     if (result === undefined) {
  //       console.log("i got no information from manual table");
  //       res.status(404).json("I got nothing from manual table");
  //     }
  //     // DB에서 정상적으로 정보 받아옴
  //     else {
  //       const manuals = result.map((row) => {
  //         return {
  //           id: row.manual_num,
  //           types: row.types,
  //           title: row.title,
  //         };
  //       });

  //       console.log(manuals);
  //       res.send(manuals);    // 매뉴얼 정보 전달
  //     }
  //   })
  // },

  // // GET 'new manual page'  (매뉴얼 등록 화면)
  // newManualPage: function (req, res) {
  //   console.log('(in adminDB.js) [GET] newManualPage');
  //   res.status(200).json("Here's the Create New Manual Page");
  // },

  // // POST 'new manual'  (매뉴얼 등록 요청)
  // newManual: function (req, res) {
  //   console.log('(in adminDB.js) [POST] newManual');

  //   const types = req.body.types;
  //   const title = req.body.title;
  //   const content = req.body.content;

  //   db.query(`INSERT INTO manual (types, title, content) VALUES(?, ?, ?)`,
  //     [types, title, content], function (error, result) {
  //       if (error) {
  //         console.log('DB 오류:', error);
  //         res.status(500).json('Fail: Create New MANUAL  ::  <Server Error> DB - while PUT NEW MANUAL');
  //       }
  //       console.log('Success create new manual!!');
  //       res.status(200).json('Success create new manual!!');
  //     }
  //   )
  // },

  // // GET 'manual deail page for manual_num'  (매뉴얼 상세페이지 화면)
  // manualDetailPage: function (req, res) {
  //   console.log('(in adminDB.js) [GET] manualDetailPage');

  //   var manualNum = req.params.manual_num;

  //   // db에서 매뉴얼 정보 추출
  //   //   -> 매뉴얼 번호, 대분로, 소분류, 상세정보
  //   db.query(`SELECT * FROM manual WHERE manual_num = ?`,
  //     [manualNum], function (error, result) {
  //       // error 발생
  //       if (error) {
  //         console.log('DB 오류: '.error);
  //         res.status(500).json('Fail: GET Manual Information  ::  Admin - DB');
  //       }

  //       // DB에 저장된 정보가 없음
  //       if (result[0] === undefined) {
  //         console.log("i got no information from manual table");
  //         res.status(404).json("I got nothing from manual table");
  //       }
  //       // DB에서 정상적으로 정보 받아옴
  //       else {

  //         const manual = {
  //           id: result[0].manual_num,
  //           types: result[0].types,
  //           title: result[0].title,
  //           content: result[0].content,
  //           eligible_item: result[0].eligible_item,
  //           ineligible_item: result[0].ineligible_item
  //         };

  //         console.log(manual);
  //         res.send(manual);    // 매뉴얼 정보 전달
  //       }
  //     })
  // },

  // // GET 'manual deail update page for manual_num'  (매뉴얼 상세페이지 수정 화면)
  // manualDetailEditPage: function (req, res) {
  //   console.log('(in adminDB.js) [GET]  manualDetailEditPage');
  //   var manualNum = req.params.manual_num;

  //   console.log("===== manualNum: ", manualNum);

  //   // db에서 매뉴얼 정보 추출
  //   //   -> 매뉴얼 번호, 대분로, 소분류, 상세정보
  //   db.query(`SELECT * FROM manual WHERE manual_num = ?`,
  //     [manualNum], function (error, result) {
  //       // error 발생
  //       if (error) {
  //         console.log('DB 오류: '.error);
  //         res.status(500).json('Fail: GET Manual Information  ::  Admin - DB');
  //       }

  //       // DB에 저장된 정보가 없음
  //       if (result[0] === undefined) {
  //         console.log("i got no information from manual table");
  //         res.status(404).json("I got nothing from manual table");
  //       }

  //       // Success to Select Informaion
  //       else {
  //         const manual = {
  //           id: result[0].manual_num,
  //           types: result[0].types,
  //           title: result[0].title,
  //           content: result[0].content,
  //           eligible_item: result[0].eligible_item,
  //           ineligible_item: result[0].ineligible_item
  //         };

  //         console.log(manual);
  //         res.send(manual);    // 문의 디테일 정보 전달
  //       }
  //     })
  // },

  // // PUT 'manual deail update for manual_num'  (매뉴얼 상세페이지 수정 요청)
  // manualDetailEdit: function (req, res) {
  //   console.log('(in adminDB.js) [PUT] manualDetailEdit');
  //   var manualNum = req.params.manual_num;

  //   const types = req.body.types;
  //   const title = req.body.title;
  //   const content = req.body.content;

  //   // 받아온 정보 DB에 UPDATE
  //   db.query('UPDATE manual SET types=?, title=?, content=? WHERE manual_num=?',
  //     [types, title, content, manualNum], function (error, result) {
  //       if (error) {
  //         console.log('DB 오류: '.error);
  //         res.status(500).json('Fail: UPDATE Manual Information  ::  Admin - DB');
  //       }
  //       else {
  //         console.log("Success UPDATE a manual detail information!!");
  //         res.status(200).json('Success: manualDetailEdit :: Update DB information SUCCESSFULLY!!!');
  //       }
  //     }
  //   )
  // },

  // // DELETE 'manual deail delete for manual_num'  (매뉴얼 상세페이지 삭제 요청)
  // manualDetailDelete: function (req, res) {
  //   console.log('(in adminDB.js)[DELETE] manualDetailDelete ');
  //   var manualNum = req.params.manual_num;

  //   console.log("-- manualNum: ", manualNum);
  //   db.query('DELETE FROM manual WHERE manual_num=?', [manualNum], function (error, result) {
  //     if (error) {
  //       console.log('DB 오류: ', error);
  //       res.status(500).json('Fail: DELETE Manual Information  ::  Admin - DB');
  //     }
  //     else {
  //       console.log("Success DELETE a manual detail information!!");
  //       res.status(200).json('Success: manualDetailEdit  ::  DELETE DB information SUCCESSFULLY!!!');
  //     }
  //   });
  // },


  // // =======================================================================
  // // <--------------------- 쓰레기통 위치 데이터 관리 ----------------------->
  // // =======================================================================
  // // GET 'trashcan location List'   (쓰레기통 위치 리스트 화면)
  // trashcanList: function (req, res) {
  //   console.log('(in adminControl.js)   [GET]  Trashcan Location List  ');

  //   db.query(`SELECT trashcan_num, town_num, town, SUM(CASE WHEN types = '일반쓰레기' THEN 1 ELSE 0 END) AS countGeneral,
  //   SUM(CASE WHEN types = '재활용' THEN 1 ELSE 0 END) AS countRecycle, COUNT(*) AS countTown FROM trashcan
  // GROUP BY town_num`, function (error, result) {
  //     if (error) {
  //       console.log("Error in DB Process  ::  Cannot SELECT from DB");
  //       res.status(500).json('Fail: DB ERROR. ');
  //     }

  //     // select NOTHING from DB   (DB에서 꺼내온 정보가 없음.) 
  //     if (result === undefined) {
  //       console.log("i got no information from manual table");
  //       res.status(404).json("I got nothing from manual table");
  //     }

  //     // DB에서 정상적으로 정보 받아옴
  //     else {
  //       const trashcan = result.map((row) => {

  //         return {
  //           id: row.trashcan_num,      // 쓰레기통 개별 번호
  //           town_num: row.town_num,     // 구 번호 (종로, 마포, ...)
  //           town: row.town,   // 구 이름
  //           countGeneral: row.countGeneral,   // 구 일반 쓰레기통 개수
  //           countRecycle: row.countRecycle,   // 구 재활용 쓰레기통 개수
  //           countTown: row.countTown,   // 구 전체 쓰레기통 개수
  //         };
  //       });

  //       console.log("This is in adminControl.js for Trashcan\n");
  //       console.log(trashcan);
  //       res.send(trashcan);    // 쓰레기통 위치 정보 전달
  //     }
  //   })
  // },

  // // GET 'trashcan Detail'  (쓰레기통 상세 화면 (자치구별))
  // trashcanDetailPage: function (req, res) {
  //   console.log('(in adminControl.js)   [GET]  Trashcan Location Detail Page  ');
  //   const townNum = req.params.town_num;

  //   db.query(`SELECT * FROM trashcan WHERE town_num=?`, [townNum], function (error, result) {
  //     if (error) {
  //       console.log("Error in DB Process  ::  Cannot SELECT from DB");
  //       res.status(500).json('Fail: DB ERROR. ');
  //     }

  //     // select NOTHING from DB   (DB에서 꺼내온 정보가 없음.) 
  //     if (result === undefined) {
  //       console.log("i got no information from manual table");
  //       res.status(404).json("I got nothing from manual table");
  //     }

  //     // DB에서 정상적으로 정보 받아옴
  //     else {

  //       const trashcan = result.map((row) => {

  //         return {
  //           id: row.trashcan_num,      // 쓰레기통 개별 번호
  //           town_num: row.town_num,     // 구 번호 (종로, 마포, ...)
  //           town: row.town,   // 구 이름
  //           street: row.street,
  //           st_address: row.st_address,
  //           detail: row.detail,
  //           placed: row.placed,
  //           types: row.types,
  //         };
  //       });

  //       console.log(trashcan);
  //       res.send(trashcan);    // 쓰레기통 위치 정보 전달
  //     }
  //   })
  // },

  // // GET 'trashcan location Create Page'   (쓰레기통 위치 등록 화면)
  // newTrashcanPage: function (req, res) {
  //   console.log('(in adminControl.js)   [GET]  Trashcan Location List  ');
  //   res.status(200).json("Success : Here's the Create New Trashcan Location Page");
  // },

  // // POST 'trashcan location Create'   (쓰레기통 위치 등록 요청)
  // newTrashcan: function (req, res) {
  //   console.log('(in adminControl.js)   [GET]  Trashcan Location List  ');

  //   const town = req.body.town;
  //   const street = req.body.street;
  //   const st_address = req.body.st_address;
  //   const detail = req.body.detail;
  //   const placed = req.body.placed;
  //   const types = req.body.types;

  //   console.log("==== +++ === (bf 1st db) town: ", town);
  //   console.log("==== +++ === (bf 1st db) : ");

  //   db.query(`SELECT * FROM trashcan WHERE town=?`, [town], function (error, result) {
  //     if (error) {
  //       console.log('Error: Cannot INSERT INTO DB');
  //       res.status(500).json('Fail: DB ERROR. ');
  //       return;
  //     }
  //     console.log("==== +++ === (bf 2nd db) result: ", result);
  //     const townNum = result[0].town_num;
  //     console.log("==== +++ === (bf 2nd db) townNum: ", townNum);
  //     db.query(`INSERT INTO trashcan (town_num, town, street, st_address, detail, placed, types) VALUES (?, ?, ?, ?, ?, ?, ?)`,
  //       [townNum, town, street, st_address, detail, placed, types], function (error2, result2) {
  //         if (error2) {
  //           console.log('Error: Cannot INSERT INTO DB');
  //           res.status(500).json('Fail: DB ERROR. ');
  //           return;
  //         }
  //       })
  //     console.log('Success create new trashcan Location Information!!');
  //     res.status(200).json('Success create new trashcan Location Information!!');
  //   })
  // },

  // // GET 'trashcan update page'   (쓰레기통 위치 수정 화면)
  // trashcanUpdatePage: function (req, res) {
  //   console.log('(in adminControl.js)   [GET]  Trashcan Location Update Page  ');
  //   const townNum = req.params.town_num;
  //   const trashcanNum = req.params.trashcan_num;

  //   db.query(`SELECT * FROM trashcan WHERE trashcan_num=?`, [trashcanNum], function (error, result) {
  //     if (error) {
  //       console.log("Error in DB Process  ::  Cannot SELECT from DB");
  //       res.status(500).json('Fail: DB ERROR. ');
  //       return;
  //     }

  //     // select NOTHING from DB   (DB에서 꺼내온 정보가 없음.) 
  //     if (result[0] === undefined) {
  //       console.log("i got no information from manual table");
  //       res.status(404).json("I got nothing from manual table");
  //       return;
  //     }



  //     // DB에서 정상적으로 정보 받아옴
  //     else {
  //       console.log("result[0]: ", result[0]);

  //       const trashcan = {
  //         id: result[0].trashcan_num,
  //         town_num: result[0].town_num,
  //         town: result[0].town,
  //         street: result[0].street,
  //         st_address: result[0].st_address,
  //         detail: result[0].detail,
  //         placed: result[0].placed,
  //         types: result[0].types
  //       };

  //       console.log(trashcan);
  //       res.send(trashcan);    // 쓰레기통 위치 정보 전달
  //     }
  //   })
  // },

  // // PUT 'trashcan location Update'   (쓰레기통 위치 수정 요청)
  // trashcanUpdate: function (req, res) {
  //   console.log('(in adminControl.js)   [PUT]  Trashcan Location  ');
  //   var trashcanNum = req.params.trashcan_num;

  //   const town = req.body.town;
  //   const street = req.body.street;
  //   const stAddress = req.body.stAddress;
  //   const detail = req.body.detail;
  //   const placed = req.body.placed;
  //   const types = req.body.types;

  //   db.query(`SELECT * FROM trashcan WHERE town=?`, [town], function (error, result) {
  //     if (error) {
  //       console.log('Error: Cannot INSERT INTO DB');
  //       return res.status(500).json('Fail: DB ERROR. ');
  //     }
  //     console.log("==== +++ === (bf 2nd db) result: ", result);
  //     const townNum = result[0].town_num;
  //     console.log("==== +++ === (bf 2nd db) townNum: ", townNum);
  //     // 받아온 정보 DB에 UPDATE
  //     db.query(`UPDATE trashcan SET town_num=?, town=?, street=?, st_address=?, detail=?, placed=?, types=? WHERE trashcan_num=?`,
  //       [townNum, town, street, stAddress, detail, placed, types, trashcanNum], function (error, result) {
  //         if (error) {
  //           console.log('DB 오류: ', error);
  //           return res.status(500).json('Fail: UPDATE Trashcan Locatiobn Information  ::  Admin - DB');
  //         }
  //         else {
  //           console.log("Success UPDATE a Trashcan Locatiobn !!");
  //           return res.status(200).json('Success: Trashcan Update :: Update DB information SUCCESSFULLY!!!');
  //         }
  //       })
  //   })
  // },

  // // DELETE 'trashcan location Delete'   (쓰레기통 위치 삭제 요청)
  // trashcanDelete: function (req, res) {
  //   console.log('(in adminControl.js)   [DELETE]  Trashcan Location  ');
  //   var trashcanNum = req.params.trashcan_num;

  //   db.query('DELETE FROM trashcan WHERE trashcan_num=?', [trashcanNum], function (error, result) {
  //     if (error) {
  //       console.log('DB 오류: '.error);
  //       return res.status(500).json('Fail: DELETE Trashcan Location  ::  Admin - DB');
  //     }
  //     else {
  //       console.log("Success DELETE a Trashcan Location!!");
  //       return res.status(200).json('Success: DELETE Trashcan Location  ::  DELETE DB information SUCCESSFULLY!!!');
  //     }
  //   });
  // },

  // // =======================================================================
  // // <------------------------ AI Result & Feedback  ---------------------->
  // // =======================================================================
  // // GET 'AI result & Feedback Page'  (AI 전체 분류 결과 및 피드백)
  // feedbackPage: function (req, res) {
  //   console.log('[GET] AI Result & Feedback Page for Admin   (in adminControl.js)');

  //   //
  //   db.query(`SELECT * FROM classification`, function (error, result) {
  //     if (error) {
  //       console.log("Error in DB Process  ::  Cannot SELECT from DB");
  //       res.status(500).json('Fail: DB ERROR. ');
  //     }

  //     // select NOTHING from DB   (DB에서 꺼내온 정보가 없음.) 
  //     if (result[0] === undefined) {
  //       console.log("i got no information from classification table");
  //       res.status(404).json("I got nothing from classification table");
  //     }


  //     //
  //     // db.query(`SELECT * FROM classification`, function (error, result) {
  //     //   // error 
  //     //   if (error) {
  //     //     console.error('DB 오류:', error);
  //     //     res.status(500).json('Fail: Login  ::  <Server Error> DB');
  //     //   }

  //     //   // Couldn't find data (불러온 데이터가 없음)
  //     //   if (result.length === 0) {
  //     //     console.log("There's no information like that");
  //     //     res.status(404).json("Fail: Login  ::  Couldn't find any data");
  //     //   }

  //     // AI 분류 결과 성공적으로 불러옴
  //     else {
  //       const feedback = result.map((row) => {

  //         // 페이지 로딩 시간 많이 소요됨 --> 이전 이미지 제외
  //         // const changeImg_bf = row.img_bf ? Buffer.from(row.img_bf).toString('base64') : null;
  //         const changeClassified = row.classified ? Buffer.from(row.classified).toString('base64') : null;

  //         return {
  //           id: row.class_num,
  //           user_num: row.user_num,
  //           date: row.date,
  //           // img_bf: changeImg_bf,
  //           classified: changeClassified,
  //           types_count: row.types_count,
  //           Cardboard: row.Cardboard,
  //           Plastic_Etc: row.Plastic_Etc,
  //           Vinyl: row.Vinyl,
  //           Styrofoam: row.Styrofoam,
  //           Glass: row.Glass,
  //           Beverage_Can: row.Beverage_Can,
  //           Canned: row.Canned,
  //           Metal: row.Metal,
  //           Paperboard: row.Paperboard,
  //           Booklets: row.Booklets,
  //           Carton: row.Carton,
  //           Paper_Etc: row.Paper_Etc,
  //           Plastic_Container: row.Plastic_Container,
  //           Clear_PET: row.Clear_PET,
  //           Colored_PET: row.Colored_PET,
  //           Packaging_Plastic: row.Packaging_Plastic,
  //           feedback: row.feedback,
  //           feed_star: row.feed_star,
  //           feed_contents: row.feed_contents,
  //         };
  //       });
  //       console.log("\n>>> console.start ==================\n");    // 매뉴얼 정보 전달
  //       console.log(feedback);    // 매뉴얼 정보 전달
  //       console.log("\n ================================================");    // 매뉴얼 정보 전달
  //       console.log(" ============================ console.finish <<<\n");    // 매뉴얼 정보 전달
  //       res.send(feedback);    // 매뉴얼 정보 전달
  //       // const classifications = result.map((row) => {
  //       //   return {
  //       //     id: row.class_num,
  //       //     types_count: row.types_count,
  //       //     Cardboard: row.Cardboard,
  //       //     Plastic_Etc: row.Plastic_Etc,
  //       //     Vinyl: row.Vinyl,
  //       //     Styrofoam: row.Styrofoam,
  //       //     Glass: row.Glass,
  //       //     Beverage_Can: row.Beverage_Can,
  //       //     Canned: row.Canned,
  //       //     Metal: row.Metal,
  //       //     Paperboard: row.Paperboard,
  //       //     Paper_Cup: row.Paper_Cup,
  //       //     Newspaper: row.Newspaper,
  //       //     Booklets: row.Booklets,
  //       //     Carton: row.Carton,
  //       //     Paper_Etc: row.Paper_Etc,
  //       //     Plastic_Container: row.Plastic_Container,
  //       //     ClearPET: row.ClearPET,
  //       //     ColoredPET: row.ColoredPET,
  //       //     Packaging_Plastic: row.Packaging_Plastic,
  //       //     feedback: row.feedback,
  //       //     feed_star: row.feed_star,
  //       //     feed_contents: row.feed_contents
  //       //   };
  //       // });

  //       // console.log(classifications);
  //       // res.send(classifications);    // 매뉴얼 정보 전달
  //     }
  //   })
  // },

  // // // GET 'images'
  // // image: function (req, res) {
  // //   console.log('[GET]    Image Screen (..?)   (in adminControl.js)');
  // //   const imageName = req.params.image_num;
  // //   db.query(`SELECT class_num, date, img_bf, classified FROM classification`)
  // // },

  // // // GET 'Download Image'
  // // downloadImage: function (req, res) {
  // //   console.log('[GET]    Download Image   (in adminControl.js)');
  // //   const imageName = req.params.image_name;

  // // db.query(`SELECT img_bf FROM classification WHERE `)

  // //   const filePath = path.join(__dirname, 'images', image_name);
  // //   res.download(filePath);
  // // },

  // // GET 'Download Image'
  // downloadImage: function (req, res) {
  //   console.log('[GET]    Download Image   (in adminControl.js)');
  //   const imageName = req.params.image_name;
  //   const mimeType = getMimeType(imageName);
  //   console.log(mimeType);      //   ex) 'image/jpeg'


  //   // 이미지 파일을 Blob으로 변환
  //   const imageNameBuffer = imageName.buffer;
  //   const imageNameBlob = imageNameBuffer.toString('base64');

  //   // DB에서 blob 된 값이 같은 이미지 파일 찾기
  //   db.query(`SELECT img_bf FROM classification WHERE img_bf=?`, [imageNameBlob], function (error, result) {
  //     // error
  //     if (error) {
  //       console.log("Error:: During DB Process");
  //       res.status(500).json("Error:: During DB Process");
  //     }

  //     // Couldn't find data (불러온 데이터가 없음)
  //     if (result.length === 0) {
  //       console.log("There's no information like that");
  //       res.status(404).json("Fail: Login  ::  Couldn't find any data");
  //     }

  //     // 일치하는 이미지 데이터 정상적으로 존재.
  //     else {
  //       res.writeHead(200, {
  //         // 'Content-Type': mimeType,
  //         'Content-Disposition': `attachment; filename="10m_${result.class_num}_${imageName}"` // 다운로드될 파일 이름 설정
  //       });
  //       res.end(imageNameBlob); // 이미지 데이터 전송  (Blob)
  //     }
  //   })
  // },


  // // =======================================================================
  // // <------------------- AI 모델 관리 및 기록 확인 ---------------------->
  // // =======================================================================
  // // GET 'AI Page'  (AI 관리 화면)
  // aiPage: function (req, res) {
  //   console.log("This is AI PAGE   (in adminControl.js)");

  //   // classification 결과 총합
  //   db.query(`SELECT * FROM AI`, function (error, result) {
  //     if (error) {
  //       console.log("Error: in DB!!");
  //       res.status(500).json("Error: in DB!!");
  //     }

  //     if (result[0] == undefined) {
  //       console.log("There's no information like that");
  //       res.status(404).json("Fail: Login  ::  Couldn't find any data");
  //     }

  //     else {
  //       const ai = result.map((row) => {

  //         const changeLabels = row.labels ? Buffer.from(row.labels).toString('base64') : null;
  //         const changeResult = row.result ? Buffer.from(row.result).toString('base64') : null;
  //         const changeConfusion = row.confusion_matrix ? Buffer.from(row.confusion_matrix).toString('base64') : null;
  //         const changeF1 = row.F1_curve ? Buffer.from(row.F1_curve).toString('base64') : null;

  //         return {
  //           version: row.version,
  //           date: row.date,
  //           size: row.size,
  //           name: row.name,
  //           labels: changeLabels,
  //           result: changeResult,
  //           confusion_matrix: changeConfusion,
  //           F1_curve: changeF1,
  //           admin_num: row.admin_num,
  //           etc: row.etc,
  //         };
  //       });
  //       res.send(ai);    // 매뉴얼 정보 전달
  //     }
  //   })
  // },


  // // =======================================================================
  // // <------------------- SUPER Admin - 관리자들 관리 ---------------------->
  // // =======================================================================
  // // GET 'Admin List'  (권한O - 관리자들 목록 화면)
  // adminsPage: function (req, res) {
  //   console.log('[GET] Admins Page for Super Admin   (in adminControl.js)');

  //   // DB에서 관리자 정보 꺼내오기
  //   db.query(`SELECT * FROM admin`, function (error, result) {
  //     // error 
  //     if (error) {
  //       console.error('DB 오류:', error);
  //       res.status(500).json('Fail: Login  ::  <Server Error> DB');
  //     }

  //     // Couldn't find data (불러온 데이터가 없음)
  //     if (result.length === 0) {
  //       console.log("There's no information like that");
  //       res.status(404).json("Fail: Login  ::  Couldn't find any data");
  //     }

  //     // 관리자 정보 성공적으로 불러옴
  //     else {
  //       const admins = result.map((row) => {
  //         return {
  //           id: row.admin_num,
  //           name: row.name,
  //           adminId: row.id,
  //           birth: row.birth,
  //           email: row.email,
  //           department: row.department,
  //           isUsed: row.isUsed,
  //           isAuth: row.isAuth
  //         };
  //       });

  //       console.log(admins);
  //       res.send(admins);    // 매뉴얼 정보 전달
  //     }
  //   })
  // },

  // // GET 'New Admin'   (권한O - 새 관리자 등록 화면)
  // newAdmin: function (req, res) {
  //   console.log('[GET] New Admin Page for Super Admin   in adminControl.js');
  //   res.status(200).json('Success: This is a New Admin Page.');
  // },

  // // POST 'Admin's Detail    (권한O - 새 관리자 등록)
  // newAdmin: function (req, res) {
  //   console.log('[POST] New Admin for Super Admin   in adminControl.js');

  //   const name = req.body.name;
  //   const id = req.body.id;
  //   const passwd = req.body.passwd;
  //   const birth = req.body.birth;
  //   const email = req.body.email;
  //   const department = req.body.department;
  //   const isAuth = req.body.isAuth;

  //   bcrypt.hash(passwd, saltRounds, (hashErr, hashedPasswd) => {
  //     if (hashErr) {
  //       console.error('비밀번호 암호화 중 오류 발생: ', hashErr);
  //       return res.status(500).json({ error: 'fail: hashing error' });
  //     }

  //     console.log("hashedPasswd: ", hashedPasswd);

  //     db.query(`INSERT INTO admin (name, id, passwd, birth, email, department, isAuth) VALUES (?, ?, ?, ?, ?, ?, ?)`,
  //       [name, id, hashedPasswd, birth, email, department, isAuth], function (error, result) {
  //         if (error) {
  //           console.log('Error: Cannot INSERT INTO DB');
  //           res.status(500).json('Fail: DB ERROR. ');
  //         }
  //         console.log('Success create new admin Information!!');
  //         res.status(200).json('Success create new admin Information!!');
  //       })
  //   })
  // },

  // // GET "Admin's Detail"     (권한O - 개별 관리자 개인 정보 화면)
  // adminDetailPage: function (req, res) {
  //   console.log('[Get] Admin Detail Page for Super Admin   in adminControl.js');
  //   var adminNum = req.params.admin_num;

  //   console.log("adminNum: (in admin detail page for super admin) :: ", adminNum);
  //   // DB에서 관리자 정보 꺼내오기
  //   db.query(`SELECT * FROM admin WHERE admin_num=?`, [adminNum], function (error, result) {
  //     // error 
  //     if (error) {
  //       console.error('DB 오류:', error);
  //       res.status(500).json('Fail: Login  ::  <Server Error> DB');
  //     }

  //     // Couldn't find data (불러온 데이터가 없음)
  //     if (result.length === 0) {
  //       console.log("There's no information like that");
  //       res.status(404).json("Fail: Login  ::  Couldn't find any data");
  //     }

  //     // 관리자 개인 정보 성공적으로 불러옴
  //     else {
  //       const admins = {
  //         id: result[0].admin_num,
  //         name: result[0].name,
  //         adminId: result[0].id,
  //         birth: result[0].birth,
  //         email: result[0].email,
  //         department: result[0].department,
  //         isUsed: result[0].isUsed,
  //         isAuth: result[0].isAuth
  //       };


  //       console.log(admins);
  //       res.send(admins);    // 매뉴얼 정보 전달
  //     }
  //   })
  // },

  // // GET "Admin's Detail"     (권한O - 관리자 수정 화면)
  // adminDetailUpdatePage: function (req, res) {
  //   console.log('[Get] Admin Detail Update Page for Super Admin   in adminControl.js');
  //   const adminNum = req.params.admin_num;

  //   // DB에서 관리자 정보 꺼내오기
  //   db.query(`SELECT * FROM admin WHERE admin_num=?`, [adminNum], function (error, result) {
  //     // error 
  //     if (error) {
  //       console.error('DB 오류:', error);
  //       res.status(500).json('Fail: Login  ::  <Server Error> DB');
  //     }

  //     // Couldn't find data (불러온 데이터가 없음)
  //     if (result.length === 0) {
  //       console.log("There's no information like that");
  //       res.status(404).json("Fail: Login  ::  Couldn't find any data");
  //     }

  //     // 관리자 개인 정보 성공적으로 불러옴
  //     else {
  //       const admins = {
  //         id: result[0].admin_num,
  //         name: result[0].name,
  //         adminId: result[0].id,
  //         birth: result[0].birth,
  //         email: result[0].email,
  //         department: result[0].department,
  //         isUsed: result[0].isUsed,
  //         isAuth: result[0].isAuth
  //       };

  //       console.log(admins);
  //       res.send(admins);    // 매뉴얼 정보 전달
  //     }
  //   })
  // },

  // // PATCH 'Admin's Detail    (권한O - 관리자 정보 수정)
  // adminDetailUpdate: function (req, res) {
  //   console.log('[PATCH] Admin Detail Update for Super Admin   in beginning.js');
  //   const adminNum = req.params.admin_num;
  //   const department = req.body.department;
  //   const isUsed = req.body.isUsed;
  //   const isAuth = req.body.isAuth;

  //   // DB Update
  //   db.query(`UPDATE admin SET department=?, isUsed=?, isAuth=? WHERE admin_num=?`,
  //     [department, isUsed, isAuth, adminNum], function (error, result) {
  //       if (error) {
  //         console.log('Error: Cannot UPDATE INTO DB');
  //         res.status(500).json('Fail: DB ERROR. ');
  //       }
  //       console.log('Success UPDATE admin Information!!');
  //       res.status(200).json('Success UPDATE admin Information!!');
  //     })
  // },

  // // DELETE 'Admin's Detail   (권한O -관리자 정보 삭제)
  // adminDetailDelete: function (req, res) {
  //   console.log('[DELETE] Admin Detail Delete for Super Admin   in beginning.js');
  //   const adminNum = req.params.admin_num;

  //   db.query(`UPDATE admin SET department='-', isUsed='N', isAuth='N' WHERE admin_num=?`, [adminNum], function (error, result) {
  //     if (error) {
  //       console.log('Error: Cannot DELETE INTO DB');
  //       res.status(500).json('Fail: DB ERROR. ');
  //     }
  //     console.log('Success DELETE admin Information!!');
  //     res.status(200).json('Success DELETE admin Information!!');
  //   })
  // }
}