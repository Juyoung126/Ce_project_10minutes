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
  // <------------------- SUPER Admin - 관리자들 관리 ---------------------->
  // =======================================================================
  // GET 'Admin List'  (권한O - 관리자들 목록 화면)
  adminsPage: function (req, res) {
    console.log('[GET] Admins Page for Super Admin   (in adminControl.js)');

    // DB에서 관리자 정보 꺼내오기
    db.query(`SELECT * FROM admin`, function (error, result) {
      // error 
      if (error) {
        console.error('DB 오류:', error);
        res.status(500).json('Fail: Login  ::  <Server Error> DB');
      }

      // Couldn't find data (불러온 데이터가 없음)
      if (result.length === 0) {
        console.log("There's no information like that");
        res.status(404).json("Fail: Login  ::  Couldn't find any data");
      }

      // 관리자 정보 성공적으로 불러옴
      else {
        const admins = result.map((row) => {
          return {
            id: row.admin_num,
            name: row.name,
            adminId: row.id,
            birth: row.birth,
            email: row.email,
            department: row.department,
            isUsed: row.isUsed,
            isAuth: row.isAuth
          };
        });

        console.log(admins);
        res.send(admins);    // 매뉴얼 정보 전달
      }
    })
  },

  // GET 'New Admin'   (권한O - 새 관리자 등록 화면)
  newAdmin: function (req, res) {
    console.log('[GET] New Admin Page for Super Admin   in adminControl.js');
    res.status(200).json('Success: This is a New Admin Page.');
  },

  // POST 'Admin's Detail    (권한O - 새 관리자 등록)
  newAdmin: function (req, res) {
    console.log('[POST] New Admin for Super Admin   in adminControl.js');

    const name = req.body.name;
    const id = req.body.id;
    const passwd = req.body.passwd;
    const birth = req.body.birth;
    const email = req.body.email;
    const department = req.body.department;
    const isAuth = req.body.isAuth;

    bcrypt.hash(passwd, saltRounds, (hashErr, hashedPasswd) => {
      if (hashErr) {
        console.error('비밀번호 암호화 중 오류 발생: ', hashErr);
        return res.status(500).json({ error: 'fail: hashing error' });
      }

      console.log("hashedPasswd: ", hashedPasswd);

      db.query(`INSERT INTO admin (name, id, passwd, birth, email, department, isAuth) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [name, id, hashedPasswd, birth, email, department, isAuth], function (error, result) {
          if (error) {
            console.log('Error: Cannot INSERT INTO DB');
            res.status(500).json('Fail: DB ERROR. ');
          }
          console.log('Success create new admin Information!!');
          res.status(200).json('Success create new admin Information!!');
        })
    })
  },

  // GET "Admin's Detail"     (권한O - 개별 관리자 개인 정보 화면)
  adminDetailPage: function (req, res) {
    console.log('[Get] Admin Detail Page for Super Admin   in adminControl.js');
    var adminNum = req.params.admin_num;

    console.log("adminNum: (in admin detail page for super admin) :: ", adminNum);
    // DB에서 관리자 정보 꺼내오기
    db.query(`SELECT * FROM admin WHERE admin_num=?`, [adminNum], function (error, result) {
      // error 
      if (error) {
        console.error('DB 오류:', error);
        res.status(500).json('Fail: Login  ::  <Server Error> DB');
      }

      // Couldn't find data (불러온 데이터가 없음)
      if (result.length === 0) {
        console.log("There's no information like that");
        res.status(404).json("Fail: Login  ::  Couldn't find any data");
      }

      // 관리자 개인 정보 성공적으로 불러옴
      else {
        const admins = {
          id: result[0].admin_num,
          name: result[0].name,
          adminId: result[0].id,
          birth: result[0].birth,
          email: result[0].email,
          department: result[0].department,
          isUsed: result[0].isUsed,
          isAuth: result[0].isAuth
        };


        console.log(admins);
        res.send(admins);    // 매뉴얼 정보 전달
      }
    })
  },

  // GET "Admin's Detail"     (권한O - 관리자 수정 화면)
  adminDetailUpdatePage: function (req, res) {
    console.log('[Get] Admin Detail Update Page for Super Admin   in adminControl.js');
    const adminNum = req.params.admin_num;

    // DB에서 관리자 정보 꺼내오기
    db.query(`SELECT * FROM admin WHERE admin_num=?`, [adminNum], function (error, result) {
      // error 
      if (error) {
        console.error('DB 오류:', error);
        res.status(500).json('Fail: Login  ::  <Server Error> DB');
      }

      // Couldn't find data (불러온 데이터가 없음)
      if (result.length === 0) {
        console.log("There's no information like that");
        res.status(404).json("Fail: Login  ::  Couldn't find any data");
      }

      // 관리자 개인 정보 성공적으로 불러옴
      else {
        const admins = {
          id: result[0].admin_num,
          name: result[0].name,
          adminId: result[0].id,
          birth: result[0].birth,
          email: result[0].email,
          department: result[0].department,
          isUsed: result[0].isUsed,
          isAuth: result[0].isAuth
        };

        console.log(admins);
        res.send(admins);    // 매뉴얼 정보 전달
      }
    })
  },

  // PATCH 'Admin's Detail    (권한O - 관리자 정보 수정)
  adminDetailUpdate: function (req, res) {
    console.log('[PATCH] Admin Detail Update for Super Admin   in beginning.js');
    const adminNum = req.params.admin_num;
    const department = req.body.department;
    const isUsed = req.body.isUsed;
    const isAuth = req.body.isAuth;

    // DB Update
    db.query(`UPDATE admin SET department=?, isUsed=?, isAuth=? WHERE admin_num=?`,
      [department, isUsed, isAuth, adminNum], function (error, result) {
        if (error) {
          console.log('Error: Cannot UPDATE INTO DB');
          res.status(500).json('Fail: DB ERROR. ');
        }
        console.log('Success UPDATE admin Information!!');
        res.status(200).json('Success UPDATE admin Information!!');
      })
  },

  // DELETE 'Admin's Detail   (권한O -관리자 정보 삭제)
  adminDetailDelete: function (req, res) {
    console.log('[DELETE] Admin Detail Delete for Super Admin   in beginning.js');
    const adminNum = req.params.admin_num;

    db.query(`UPDATE admin SET department='-', isUsed='N', isAuth='N' WHERE admin_num=?`, [adminNum], function (error, result) {
      if (error) {
        console.log('Error: Cannot DELETE INTO DB');
        res.status(500).json('Fail: DB ERROR. ');
      }
      console.log('Success DELETE admin Information!!');
      res.status(200).json('Success DELETE admin Information!!');
    })
  }
}