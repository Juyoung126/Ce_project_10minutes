const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const db = require('./db');
const bcrypt = require('bcrypt');
const { createSecretKey } = require('crypto');
const verifyEmail = require('./verifyEmail');
const saltRounds = 10;  // 해싱에 사용. 보안을 높여주기 위해서? 비교를 위해서...


app.use(express.json());
// app.use(express.static(path.join(__dirname, '/../view/web/build', 'utf8')));
app.use(bodyParser.urlencoded({ extended: false }));




module.exports = {
  // GET 'first page' (초기 화면)
  firstPage: function (req, res) {
    console.log('[GET] FirstPage for Admin   in adminAccount.js');
    res.sendFile(path.join(__dirname, '/../view/web/build/index.html'));
  },
  // GET 'first page' (초기 화면)
  appDownload: function (req, res) {
    console.log('[GET] appDownload for Admin   in adminAccount.js');

    // APK 파일 경로 설정
    const filePath = path.join(__dirname, '/../../app-release.apk');
    // 파일을 사용자에게 전송
    res.download(filePath, 'app-release.apk', (err) => {
      if (err) {
        // 에러 핸들링
        res.status(500).send("파일 다운로드 중 오류가 발생했습니다.");
      }
    });
  },
  // GET 'login page' (로그인 화면)
  loginPage: function (req, res) {
    console.log('[GET] LoginPage for Admin   in adminAccount.js');
    // res.sendFile(path.join(__dirname, '/../view/web/build/index.html'));
  },
  // POST 'Login' (로그인 처리)
  login: function (req, res) {
    console.log('[POST] Login for Admin   in adminAccount.js');
    const { id, passwd } = req.body;
    console.log("id & password from admin: ", id, passwd);
    const inputId = id;
    const inputPasswd = passwd;

    // Select db query to check requested id & password
    db.query(`SELECT id, passwd FROM admin WHERE id = ?`,
      [inputId], function (error, result) {
        console.log('\n\n(in db.query)  [after SELECT] --------  (i got your id and passwd HAHA!)')
        // error 
        if (error) {
          console.error('DB 오류:', error);
          res.status(500).json('Fail: Login  ::  <Server Error> DB');
        }
        console.log('(in db.query)  [after if] ------> 1. passed 1st error test')


        // Wrong id (존재하지 않는 ID)
        if (result[0] === undefined) {
          console.log('(in db.query)  [in 2nd if] ------> 2-1. you have to sign up!')
          res.status(401).json('Fail: Login  ::  Wrong ID');
        }

        // Corect id  (존재하는 ID)
        else {
          console.log('(in db.query)  [in else] ------> 2-2. you are an admin!')

          console.log("result: ", result);
          // Compare to real password
          const checkResult = bcrypt.compare(inputPasswd, result[0].passwd);

          // Wrong Password  ==> Login Fail   (비밀번호 미일치. 로그인 실패)
          if (!checkResult) {
            console.error('비밀번호 비교 오류:', error);
            res.status(401).json('Fail: Login  ::  Wrong Password');
          }

          // Correct Password  ==> Login Success   (비밀번호 일치. 로그인 성공)
          // Save a session
          else {
            console.log('로그인이 성공!')
            // 세션 저장
            req.session.is_logined = true;
            req.session.login_id = result[0].id;
            req.session.is_admin = true;
            // 사용자 이름 저장
            const adminData = {
              name: result[0].name
            };
            // JSON 응답을 보냅니다.
            res.status(200).json("success");
            // res.redirect('/main');


            // 메인 화면으로 redirect
            // ERROR!! ==> res.json 이후 또 res.redirect 불가능! 둘 중 하나만 해야함
            // ===> 서버: 정보 전달, 클라이언트: redirect 하면 문제 없음!
            // res.redirect('/main');
          }
        }
      })
  },
  // POST 'Logout' (로그아웃 요청 처리)
  logout: function (req, res) {
    console.log('[POST] Logout for Admin   in adminAccount.js');

    console.log("req.session.is_logined: ", req.session.is_logined);
    console.log("req.session.login_id: ", req.session.login_id);
    console.log(" req.session.is_admin: ", req.session.is_admin);

    // 로그아웃 요청이 들어오면, 세션 삭제 후 로그인 페이지로 redirect
    req.session.destroy(function (error) {
      console.log("\n\n\n<Trying to destroy the session>")
      if (error) {
        console.log("this is ERROR PAGE for destroy the session");
        console.log(error);
      }
      else {
        console.log("NO ERROR in destroying the session");
        res.status(200).json('Success: Logout');
      }
    })
  },

  // GET 'Main page' (메인 화면)
  mainPage: function (req, res) {
    console.log('[GET] MainPage for Admin   in adminAccount.js');
    const requestId = req.session.login_id
    let sumOfUserNum = 0;

    // db.query(`SELECT isUsed, isAuth FROM admin WHERE id=adminId`, [requestId], function (error, result) {
    // db.query(`SELECT isAuth FROM admin WHERE id=adminId`, [requestId], function (error, result) {
    //   if (error) {
    //     console.log('ERROR: in Using DB');
    //     res.status(500).json('CANNOT USE DB');
    //   }

    //   if (result[0] === undefined) {
    //     console.log("There's no information like that");
    //     res.status(404).json("There's no information");
    //   }

    //   else {
    db.query(`SELECT COUNT(user_num) as countUser FROM user`, function (error2, result2) {
      if (error2) {
        console.log('ERROR: in Using DB');
        res.status(500).json('CANNOT USE DB');
      }
      else {
        console.log("(in 2nd DB ---- sumOfUserNum ::: ", sumOfUserNum);
        sumOfUserNum = result2[0].countUser;
        console.log("(in 2nd DB ---- sumOfUserNum (after) ::: ", sumOfUserNum);


        // const sqlQuery = `SELECT COUNT(class_num) as countTotal, SUM(types_count) as sumClassified, SUM(Cardboard) as sum1,
        //     SUM(Plastic_Etc) as sum2, SUM(Vinyl) as sum3, SUM(Styrofoam) as sum4, SUM(Glass) as sum5, SUM(Beverage_Can) as sum6, 
        //     SUM(Canned) as sum7, SUM(Metal) as sum8, SUM(Paperboard) as sum9, SUM(Booklets) as sum10, SUM(Carton) as sum11, 
        //     SUM(Paper_Etc) as sum12, SUM(Plastic_Container) as sum13, SUM(Clear_PET) as sum14, SUM(Colored_PET) as sum15, 
        //     SUM(Packaging_Plastic) as sum16, COUNT(feed_star) as countFeed, SUM(feed_star) as sumFeed FROM clssification`;

        db.query(`SELECT COUNT(class_num) as countTotal, SUM(types_count) as sumClassified, SUM(Cardboard) as sum1,
        SUM(Plastic_Etc) as sum2, SUM(Vinyl) as sum3, SUM(Styrofoam) as sum4, SUM(Glass) as sum5, SUM(Beverage_Can) as sum6, 
        SUM(Canned) as sum7, SUM(Metal) as sum8, SUM(Paperboard) as sum9, SUM(Booklets) as sum10, SUM(Carton) as sum11, 
        SUM(Paper_Etc) as sum12, SUM(Plastic_Container) as sum13, SUM(Clear_PET) as sum14, SUM(Colored_PET) as sum15, 
        SUM(Packaging_Plastic) as sum16, COUNT(feed_star) as countFeed, SUM(feed_star) as sumFeed FROM classification`, function (error3, result3) {
          if (error3) {
            console.log("ERROR: in DB  ::: ", error3)
            return res.status(500).json('CANNOT SELEVT FROM DB');
          }
          else {
            console.log('in 3rd DB -- result3 :: ', result3);

            const mainData = {
              sumOfUserNum: sumOfUserNum,
              countTotal: result3[0].countTotal,
              sumClassified: result3[0].sumClassified,
              cardboard: result3[0].sum1,
              plasticEtc: result3[0].sum2,
              vinyl: result3[0].sum3,
              styrofoam: result3[0].sum4,
              glass: result3[0].sum5,
              beverageCan: result3[0].sum6,
              canned: result3[0].sum7,
              metal: result3[0].sum8,
              paperboard: result3[0].sum9,
              booklets: result3[0].sum10,
              carton: result3[0].sum11,
              paperEtc: result3[0].sum12,
              plasticContainer: result3[0].sum13,
              clearPet: result3[0].sum14,
              coloredPet: result3[0].sum15,
              packagingPlastic: result3[0].sum16,
              countFeed: result3[0].countFeed,
              sumFeed: result3[0].sumFeed
            };

            console.log(mainData);
            res.send(mainData);    // 매뉴얼 정보 전달
          }
        })
      }
    })
    //   }
    // })
  },

  // GET 'Id & Passwd Page'  (아이디/비밀번호 찾기 화면)
  idPwPage: function (req, res) {
    console.log('[GET] idPwPage for Admin   in adminAccount.js');
    res.status(200).json('Success: Find ID & PASSWORD Page');
  }
}