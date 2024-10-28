const express = require('express');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const verifyToken = require('./verifyToken');
const app = express();
app.use(express.json());

const saltRounds = 10;  //보안을 높여주기 위해서? 비교를 위해서...

var pool = mysql.createPool({
  host: 'localhost',  // 데이터베이스 서버가 있는 주소.
  port: 3306,
  user: 'dbid232',     // 데이터베이스에 접근하기 위한 ID
  password: 'dbpass232',     // 데이터베이스에 접근하기 위한 Password
  database: 'db23201'   // 접근하고자 하는 데이터베이스 이름
});

// pool 객체 초기화
pool.getConnection((err, conn) => {
  if (err) {
    console.error('pool 데이터베이스 연결 오류:', err);
  } else {
    console.log('pool 데이터베이스 연결 성공');
    conn.release();
  }
});

// 인증 코드 생성 함수 예시
function generateVerificationCode() {
  return Math.random().toString(36).substring(2, 8); // 무작위 인증 코드 생성 (예: abcd123)
}

// Nodemailer 설정
const transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",   // 또는 다른 이메일 제공업체를 사용하려면 해당 정보를 입력하세요.
  port: 2525,
  auth: {
    user: "8681c713d7f242",   // 이메일 계정
    pass: "860943b08db412"    // 이메일 계정의 비밀번호
  }
});

module.exports ={
  //이메일 인증 이메일 전송 라우트
  emailAuth: function(req, res){
    const email = req.body.email;    // 사용자가 입력한 이메일 주소
    console.log('email: ', email);
    const verificationCode = generateVerificationCode();
    const mailOptions = {
      from: '8681c713d7f242',
      to: email,    // 수신자 이메일 주소 (사용자가 입력한 이메일 주소)
      subject: '회원가입을 위한 본인 인증 코드',
      text: `인증 코드: ${verificationCode}`
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        res.json({ success: false });
        console.error('이메일 보내기 실패:', error);
      } else {
        res.json({code: verificationCode});
        console.error('이메일 보내기 성공:', info.response, '\n인증번호: ',verificationCode);
      }
    });
  },
  // 로그인 중복 확인
  checkId: function (req, res) {
    const id = req.body.id;
    const sql = 'SELECT * FROM user WHERE id = ?';
    return pool.getConnection()
      .then(conn => {
        // 사용자 정보를 데이터베이스에 삽입
        return conn.query('SELECT * FROM user WHERE id = ?', [id])
          .then((result) => {
              
              if (result[0].length > 0) {
                console.log('사용중인 아이디 입니다.');
                res.status(401).json({ success: '사용중인 아이디입니다.' });
              } else {
                console.log('사용가능한 아이디 입니다.');
                res.status(200).json({ success: '사용가능한 아이디입니다.' });
              }
          })
            .catch(err => {
              console.error('데이터베이스 쿼리 오류:', err);
              res.status(500).json({ success: false }); // 데이터베이스 오류
            })
            .finally(() => {
              conn.release(); // 연결 반환
            });
        })
        .catch(err => {
          console.error('데이터베이스 연결 오류:', err);
          res.status(500).json({ success: false }); // 데이터베이스 오류
        });
    },
  //POST 'signup'
  signUp : function(req, res){
    const id = req.body.signupForm.id;
    const name = req.body.signupForm.name;
    const nickname = req.body.signupForm.nickname;
    const birthdate = req.body.signupForm.birthdate;
    const email = req.body.signupForm.email;
    const password = req.body.signupForm.password;

  // 비밀번호 해싱
  bcrypt.hash(password, saltRounds)
    .then(hashedPassword => {
      const userData = {
        u_id: id,
        u_name: name,
        u_nickname: nickname,
        u_birthdate: birthdate,
        u_email: email,
        u_password: hashedPassword,
      };

      // 데이터베이스 연결 가져오기
      return pool.getConnection()
        .then(conn => {
          // 사용자 정보를 데이터베이스에 삽입
          return conn.query('INSERT INTO user (name, nickname, id, passwd, birth, email) VALUES (?, ?, ?, ?, ?, ?)',
            [
              userData.u_name,
              userData.u_nickname,
              userData.u_id,
              userData.u_password,
              userData.u_birthdate,
              userData.u_email
            ])
            .then((result) => {
              console.log('사용자 정보가 데이터베이스에 저장되었습니다.');
              res.json({ success: true }); //회원가입이 완료되었습니다.
            })
            .catch(err => {
              console.error('데이터베이스 쿼리 오류:', err);
              res.status(500).json({ success: false }); // 데이터베이스 오류
            })
            .finally(() => {
              conn.release(); // 연결 반환
            });
        })
        .catch(err => {
          console.error('데이터베이스 연결 오류:', err);
          res.status(500).json({ success: false }); // 데이터베이스 오류
        });
    })
    .catch(err => {
      console.error('비밀번호 해싱 오류:', err);
      res.status(500).json({ success: false }); // 비밀번호 해싱 오류
    });
  },
  
  login: async function (req,res){
    const userInputId = req.body.loginForm.id; // 사용자가 입력한 아이디
    const userPassword = req.body.loginForm.password; // 사용자가 입력한 비밀번호
    const secretKey = '92d9eac1e1242e2c77e93636b1786cebdeb671fd2a3ba9d6070c6a2c51e0146c';

    try {
      const connection = await pool.getConnection();

      const [rows] = await connection.execute('SELECT * FROM user WHERE id = ?', [userInputId]);
      if (rows.length > 0) {
        const userData = rows[0];
        const result = await bcrypt.compare(userPassword, userData.passwd);

        if (result) {
          const currentTime = Math.floor (Date.now() / 1000);
          const expiresIn = 60*60;
          const user = {
            id: userInputId,
            iat: currentTime
          };
          const accessToken = jwt.sign({ user }, secretKey, {expiresIn});
          console.log('토큰 발급 완료');
          res.status(200).json(accessToken);
        } else {
          res.status(401).json('fail: Passwords do not match.');
          console.log('');
        }
      } else {
        res.status(401).json('fail: User does not exist.');
        console.log('로그인 실패2');
      }

      connection.release();
    } catch (error) {
      console.error('데이터베이스 오류:', error);
      res.status(500).json('fail: server error');
    }
  },
  // 아이디/비번 찾기 이메일 인증(post)
  verify: async function (req, res) {
    const inputEmail = req.body.email;
    console.log('inputEmail: ', inputEmail);
    try {
      const connection = await pool.getConnection();
      const [rows] = await connection.execute('SELECT email FROM user WHERE email = ?', [inputEmail]);
      
      if (rows.length > 0) {
        const userData = rows[0];
        const result = userData.email;
  
        const verificationCode = generateVerificationCode();
  
        const mailOptions = {
          from: 'fbc5abc4f2d014',
          to: result, // 수정: email 대신에 result 사용
          subject: '아이디/비밀번호 찾기를 위한 본인 인증 코드',
          text: `인증 코드: ${verificationCode}`
        };
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            res.json({ success: false });
            console.error('이메일 보내기 실패:', error);
          } else {
            res.json({ code: verificationCode });
            console.log(verificationCode);
            console.log('이메일 보내기 성공:', info.response); 
          }
        });
      }
    } catch (error) {
      console.error("에러:", error);
      res.status(500).json("내부 서버 오류");
    }
  },
  
  // 아이디 찾기 요청
  id: async function (req, res) {
    try {
      // 이름 & 이메일 입력
      const inputName = req.body.name;
      const inputEmail = req.body.email;
  
      const connection = await pool.getConnection();
  
      // 이름과 이메일을 이용해 사용자 조회
      const [result] = await connection.execute('SELECT name, id, email FROM user WHERE name = ? AND email = ?', [inputName, inputEmail]);
  
      // DB에서 받아온 정보 출력
      console.log("result: ", result[0]);
  
      // 회원정보 일치 실패
      if (result[0] === undefined) {
        console.log('fail: user not found');
        connection.release(); // 연결 해제
        res.status(404).json('fail: user not found');
        return;
      }
  
      // 회원정보 일치 성공
      console.log('Success: login ');
  
      const yourId = result[0].id;
      connection.release(); // 연결 해제
      res.status(200).json(yourId);
    } catch (error) {
      console.error('에러:', error);
      res.status(500).json('내부 서버 오류');
    }
  },
  
  
  // 비밀번호 찾기(재설정) 요청
  pw: async function (req, res) {
    try {
      // 입력된 이름 & 아이디 & 이메일 저장
      const inputName = req.body.name;
      const inputId = req.body.id;
      const inputEmail = req.body.email;
  
      const connection = await pool.getConnection();
  
      // 이름, 아이디, 이메일을 이용해 사용자 조회
      const [result] = await connection.execute('SELECT name, id, passwd, email FROM user WHERE name = ? AND id = ? AND email = ?', [inputName, inputId, inputEmail]);
  
      // DB에서 받아온 정보 출력
      console.log("result: ", result[0]);
  
      // 회원정보 일치 실패
      if (result[0] === undefined) {
        console.log('fail: user not found');
        connection.release(); // 연결 해제
        res.status(404).json('fail: not found');
        return;
      }
  
      // 회원정보 일치 성공
      console.log('Reset the password.');
      connection.release(); // 연결 해제
      res.json({ success: true });
    } catch (error) {
      console.error('에러:', error);
      res.status(500).json('내부 서버 오류');
    }
  },
  

  // newPasswd: async function (req, res) {
  //   const newPw = req.body.passwd.newPw;
  //   const userId = req.body.id;
  //   console.log('newPw:', newPw);
  //   console.log('userId:', userId);

  //   bcrypt.hash(newPw, saltRounds, function (err, hashedPassword) {
  //     console.log ('in bcrypt.hash');
  //     if (err) {
  //       console.error('bcrypt.hash error:', err);
  //       res.status(500).json({ error: '비밀번호 해싱 중 오류가 발생했습니다.' });
  //     } else {
  //       pool.getConnection(function (connectionError, connection) {
  //         if (connectionError) {
  //           console.error('Database connection error:', connectionError);
  //           res.status(500).json({ error: '데이터베이스 연결 중 오류가 발생했습니다.' });
  //         } else {
  //           const sql = 'UPDATE user SET passwd = ? WHERE id = ?';
  //           connection.query(sql, [hashedPassword, userId], function (queryError, result) {
  //             connection.release(); // 연결 해제

  //             if (queryError) {
  //               console.error('Database query error:', queryError);
  //               res.status(500).json({ error: '데이터베이스 쿼리 중 오류가 발생했습니다.' });
  //             } else {
  //               console.log('데이터 저장이 성공했습니다.');
  //               res.json({ success: true });
  //             }
  //           });
  //         }
  //       });
  //     }
  //   });
  // },
  newPasswd: function (req, res) {
    const newPw = req.body.passwd.newPw;
    const userId = req.body.id;
  
    pool.getConnection()
    .then(connection => {
      console.log('after getConnection');

      bcrypt.hash(newPw, saltRounds)
        .then(hashedPassword => {
          console.log('newPw:', newPw);
          console.log('userId:', userId);

          const sql = 'UPDATE user SET passwd = ? WHERE id = ?';
          return connection.query(sql, [hashedPassword, userId])
            .then(result => {
              console.log('after query');
              console.log('데이터 저장이 성공했습니다.');
              res.json({ success: true });
            })
            .catch(err => {
              console.error('Database query error:', err);
              res.status(500).json({ error: '데이터베이스 쿼리 중 오류가 발생했습니다.' });
            })
            .finally(() => {
              connection.release();
            });
        })
        .catch(err => {
          console.error('bcrypt.hash error:', err);
          res.status(500).json({ error: '비밀번호 해싱 중 오류가 발생했습니다.' });
        });
    })
    .catch(err => {
      console.error('Database connection error:', err);
      res.status(500).json({ error: '데이터베이스 연결 중 오류가 발생했습니다.' });
    });
  },
  
  // 로그아웃 요청
  logout: function(req, res){
    verifyToken(req, res, () => {
      // 클라이언트에서 Authorization 헤더에 있는 토큰을 삭제
      // Authorization 대소문자 통일
      res.setHeader('Authorization', '');  
      res.json({ success: true });
    });
  }, 
  // 회원 탈퇴 요청
  delete: async function (req, res) {
    verifyToken(req, res, async () => {
      try {
        const userId = req.user.id;
        console.log('userId(Delete/Account): ', userId);
  
        // Get connection using promise
        pool.getConnection()
          .then(async connection => {
            console.log('after getConnection');
            const deleteQuery = 'DELETE FROM user WHERE id = ?';
            return connection.query(deleteQuery, userId)
            .then(result =>{
              console.log('after query');
              console.log('데이터 삭제가 성공했습니다.');
              res.json({ success: true });
            })
            .catch(err => {
              console.error('Database query error:', err);
              res.status(500).json({ error: '데이터베이스 쿼리 중 오류가 발생했습니다.' });
            })
            .finally(() => {
              connection.release();
            });
          })
          .catch(err => {
            console.error('오류 발생:', err);
            res.status(500).json({ error: '회원 탈퇴 중 오류가 발생했습니다.' });
          });
      } catch (err) {
        console.error('오류 발생:', err);
        res.status(500).json({ error: '회원 탈퇴 중 오류가 발생했습니다.' });
      }
    });
  }
  
}