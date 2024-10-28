const cors = require('cors');
const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const port = 60001;   // port number
// const methodOverride = require('method-override')


app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'view/web/build')));
app.use(bodyParser.urlencoded({ extended: false }));
// app.use(methodOverride('_method'))


// 세션 (for Admin) ========================================================
var session = require('express-session');
var MySqlStore = require('express-mysql-session')(session);

var options = {
  host: 'localhost',  // 데이터베이스 서버가 있는 주소.
  port: 3306,
  user: 'dbid232',     // 데이터베이스에 접근하기 위한 ID
  password: 'dbpass232',     // 데이터베이스에 접근하기 위한 Password
  database: 'db23201'   // 접근하고자 하는 데이터베이스 이름
}
var sessionStore = new MySqlStore(options);

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  store: sessionStore
}));
// ========================================================================


// =========================================================================
// <------------------------- Server for Common --------------------------->
// <--------- Login, Logout, Signup, Find ID&PASSWORD, MAIN PAGE ---------->
// =========================================================================
var adminAccount = require('./model/adminAccount');
var userAuthRouter = require('./lib/userAuthRouter.js');
const mobileMain = require('./lib/mobileMainRouter.js');

// 'login Page' (로그인 화면)
app.get('/', function (req, res) {
  console.log("this request is from admin")
  adminAccount.loginPage(req, res);
});
// 'login' (로그인하기)
app.post('/', function (req, res) {
  const who = req.header('Who');
  console.log("[POST /] - [Login] - HEADER: ", who)

  if (who === 'Admin') {
    console.log("this request is from admin")
    adminAccount.login(req, res);
  }
  else {
    console.log("this request is from user")
    userAuthRouter.login(req, res);
  }
});
// 'Logout'   (로그아웃하기)
app.post('/logout', function (req, res) {
  const who = req.header('Who');
  console.log("[from Admin Logout] - HEADER: ", who);
  if (who === 'Admin') {
    console.log("this [Logout] request is from admin")
    adminAccount.logout(req, res);
  }
  else {
    console.log("this request is from user")
    userAuthRouter.logout(req, res);
  }
});
// 'main page'    (메인 화면)
app.get('/main', function (req, res) {
  const who = req.header('Who');
  console.log("[GET /main] - [Main] - HEADER: ", who)
  console.log("======Session: ", req.session);

  if (req.session.is_admin) {
    console.log("this request is from admin")
    adminAccount.mainPage(req, res);
  }
  else {
    console.log("this request is from user")
    mobileMain.getMain(req, res);
  }
});
// find id & pw   (아이디/비번 찾기 화면)
app.get('/idPw', function (req, res) {
  adminAccount.idPwPage(req, res);
});
// verify Email  (아이디/비밀번호 찾기 전 이메일 인증)
app.post('/verify', function (req, res) {
  const who = req.header('Who');
  console.log("HEADER: ", who)

  if (who === 'Admin') {
    console.log("this request is from admin")
    adminAccount.verify(req, res);
  }
  else {
    console.log("this request is from user")
    userAuthRouter.verify(req, res);
  }
});
// find id   (아이디 찾기)
app.post('/id', function (req, res) {
  const who = req.header('Who');
  console.log("HEADER: ", who)

  if (who === 'Admin') {
    console.log("this request is from admin")
    adminAccount.id(req, res);
  }
  else {
    console.log("this request is from user")
    userAuthRouter.id(req, res);
  }
});
// // find pw   (비밀번호 찾기)
// app.post('/pw', function (req, res) {
//   const who = req.header('Who');
//   console.log("HEADER: ", who)

//   if (who === 'Admin') {
//     console.log("this request is from admin")
//     adminAccount.pw(req, res);
//   }
//   else {
//     console.log("this request is from user")
//     userAuthRouter.pw(req, res);
//   }
// });
// make a new pw page  (새 비밀번호 만들기 화면)
app.get('/newPasswd', function (req, res) {
  adminAccount.newPasswdPage(req, res);
});
// make a new pw   (새 비밀번호 만들기)
// app.put('/newPasswd', function (req, res) {
//   // const who = req.header('Who');
//   // console.log("HEADER: ", who)

//   // if (who === 'Admin') {
//   //   console.log("this request is from admin")
//   //   adminAccount.newPasswd(req, res);
//   // }
//   // else {
//   console.log("this request is from user")
//   userAuthRouter.newPasswd(req, res);
//   // }
// });
// make a new pw  (for web) (새 비밀번호 만들기)
app.patch('/newPasswd', function (req, res) {
  const who = req.header('Who');
  console.log("HEADER: ", who)

  if (who === 'Admin') {
    console.log("this request is from admin")
    adminAccount.newPasswd(req, res);
  }
  else {
    console.log("this request is from user")
    userAuthRouter.newPasswd(req, res);
  }
});
// sign up  (only for app) (회원가입)
app.post('/account', function (req, res) {
  userAuthRouter.signUp(req, res);
});
// email Verify (only for app)  (회원가입용 이메일 인증)
app.get('/emailAuth', function (req, res) {
  userAuthRouter.emailAuth(req, res);
});
// delete account (only for app)  (회원 탈퇴)
app.delete('/account', function (req, res) {
  const who = req.header('Who');
  console.log("HEADER: ", who);
  if (who === Admin) {
    console.log("this request is from admin")
    adminAccount.mainPage(req, res);
  }
  else {
    console.log("this request is from user")
    userAuthRouter.delete(req, res);
  }
});

// My Information Page (관리자 & 사용자 개인정보 화면)
app.get('/myinfo', function (req, res) {
  const who = req.header('Who');
  console.log("HEADER: ", who)

  if (req.session.is_admin) {
    console.log("this request is from admin  (for '/myifo')  ");
    adminAccount.myInfoPage(req, res);
  }
  else {
    console.log("this request is from user")
    userMypage.userinfo(req, res);
  }
});

// Check Current Password Page (개인정보 수정을 위한 현재 비밀번호 확인)
app.get('/passwdAuth', function (req, res) {
  adminAccount.passwdAuthPage(req, res);
});
// Check Current Password (개인정보 수정을 위한 현재 비밀번호 확인)
app.post('/passwdAuth', function (req, res) {
  if (req.session.is_admin) {
    console.log("this request is from admin")
    adminAccount.passwdAuth(req, res);
  }
  else {
    console.log("this request is from user");
    userMypage.passwdAuth(req, res);
  }
});
// Update User's Information  (only for app) (사용자 개인정보 수정)
app.put('/myinfo', function (req, res) {
  userMypage.userinfoChange(req, res);
});

// =======================================================================
// <------------------------ Server for Admin --------------------------->
// =======================================================================
const adminDB = require('./model/adminDB');

// 사용자 관리 >>>>>>>>>>
// 사용자 리스트 화면
app.get('/users', function (req, res) {
  console.log("this request is from Admin");
  adminDB.userList;
});
// 사용자 개인 정보 화면
app.get('/users/:userNum', function (req, res) {
  console.log("this request is from Admin");
  adminDB.userDetail;
});
// 사용자 정보 수정 화면
app.get('/users/:userNum', function (req, res) {
  console.log("this request is from Admin");
  adminDB.userUpdatePage;
});
// 사용자 정보 수정
app.put('/users/:userNum', function (req, res) {
  console.log("this request is from Admin");
  adminDB.userUpdate;
});
// 사용자 정보 삭제
app.delete('/users/:userNum', function (req, res) {
  console.log("this request is from Admin");
  adminDB.userDelete;
});
// 사용자 개인 분리배출 히스토리 조회
app.get('/users/:userNum/transHis', function (req, res) {
  console.log("this request is from Admin");
  adminDB.userTrash;
});
// 사용자 개인 캐릭터 히스토리 조회
app.get('/users/:userNum/animalHis', function (req, res) {
  console.log("this request is from Admin");
  adminDB.userPet;
});

// 매뉴얼 관리 >>>>>>>>>>>>>>>>>>
// GET 'manual list'  (매뉴얼 리스트)
app.get('/manual', function (req, res) {
  const who = req.header('Who');
  console.log("HEADER: ", who);
  if (who === 'Admin') {
    console.log("this request is from admin (manualList)");
    adminDB.manualList(req, res);
  }
});
// GET 'new manual page'  (메뉴얼 등록 화면)
app.get('/manual/newManual', function (req, res) {
  console.log("this request is from admin (manualList)");
  adminDB.newManualPage(req, res);
});
// POST 'new manual'  (메뉴얼 등록 요청)
app.post('/manual/newManual', function (req, res) {
  console.log("this request is from admin (manualList)");
  adminDB.newManual(req, res);
});
// GET 'manual deail page for manual_num'  (메뉴얼 상세페이지 화면)
app.get('/manual/:manual_num', function (req, res) {
  console.log("this request is from admin (manualList)");
  adminDB.manualDetailPage(req, res);
});
// GET 'manual deail update page for manual_num'  (메뉴얼 상세페이지 수정 화면)
app.get('/manual/:manual_num/editing', function (req, res) {
  console.log("this request is from admin (manualList)");
  adminDB.manualDetailEditPage(req, res);
});
// PUT 'manual deail update for manual_num'  (메뉴얼 상세페이지 수정 요청)
app.put('/manual/:manual_num/editing', function (req, res) {
  console.log("this request is from admin (manualList)");
  adminDB.manualDetailEdit(req, res);
});
// DELETE 'manual deail delete for manual_num'  (메뉴얼 상세페이지 삭제 요청)
app.delete('/manual/:manual_num', function (req, res) {
  console.log("this request is from admin (manualList)");
  adminDB.manualDetailEdit(req, res);
});

// GET 'Admin List'  (only for authoritative person)   (권한O - 관리자들 목록 화면)
app.get('/admins', function (req, res) {
  console.log("this request is from admin");
  adminDB.adminsPage(req, res);
});
// GET 'New Admin'  (only for authoritative person)   (권한O - 새 관리자 등록 화면)
app.get('/admins/newAdmin', function (req, res) {
  console.log("this request is from admin");
  adminDB.newAdmin(req, res);
})
// POST 'Admin's Detail  (only for authoritative person)   (권한O - 새 관리자 등록)
app.post('/admins/newAdmin', function (req, res) {
  console.log("this request is from admin");
  adminDB.newAdmin(req, res);
});
// GET 'Admin's Detail  (only for authoritative person)   (권한O - 관리자 정보 화면)
app.get('/admins/:adminNum', function (req, res) {
  console.log("this request is from admin");
  adminDB.adminDetailPage(req, res);
});
// PUT 'Admin's Detail  (only for authoritative person)   (권한O - 관리자 정보 수정)
app.put('/admins/:adminNum', function (req, res) {
  console.log("this request is from admin");
  adminDB.adminDetailUpdate(req, res);
});
// DELETE 'Admin's Detail  (only for authoritative person)   (권한O -관리자 정보 삭제)
app.delete('/admins/:adminNum', function (req, res) {
  console.log("this request is from admin");
  adminDB.adminDetail(req, res);
});






// =======================================================================
// <------------------------- Server for User --------------------------->
// =======================================================================
// const ?? = require('');
const userMypage = require('./lib/myPageRouter.js');
const animalPage = require('./lib/charRouter.js');
const trashManual = require('./lib/manualRouter.js');
const trashCan = require('./lib/trahcanRouter.js');
const qna = require('./lib/qnaRouter.js');
// 사용자 메인 페이지
//GET 'user's Mypage'
app.get('/mypage', function (req, res) {
  console.log("this request is from user");
  userMypage.mypage(req, res);
});
// GET 'user's info'
app.get('/myInfo', function (req, res) {
  console.log("this request is from user");
  userMypage.userinfo(req, res);
});
// PUT 'user's info'
app.patch('/mypage', function (req, res) {
  console.log("this request is from user");
  userMypage.userinfoChange(req, res);
});
//GET 'Character history'
app.get('/petHistroy', function (req, res) {
  console.log("this request is from user");
  userMypage.pastPet(req, res);
});
//GET 'classification history'
app.get('/history', function (req, res) {
  console.log("this request is from user");
  userMypage.pastHistory(req, res);
});


// 사용자 캐릭터 관리 
// GET 'Main character'
app.get('/pet', function (req, res) {
  console.log("this request is from user");
  animalPage.petLoad(req, res);
});
// GET 'New Character page'
app.get('/newPet', function (req, res) {
  console.log("this request is from user");
  animalPage.newPetpage(req, res);
});
// POST 'new character'
app.post('/newPet', function (req, res) {
  console.log("this request is from user");
  animalPage.newPetCreate(req, res);
});
app.patch('/petGrowth', function (req, res) {
  console.log("this request is from user");
  animalPage.petGrowth(req, res);
});
// 매뉴얼
// GET 'manual list'
app.get('/manual', function (req, res) {
  console.log("this request is from user");
  trashManual.manual(req, res);
});
// GET '{manual_num} detail'
app.get('/manual/:manual_num', function (req, res) {
  console.log("this request is from user");
  trashManual.manualDetail(req, res);
});

// 공공쓰레기통 
// GET 'trashCan list'
app.get('/trashcan', function (req, res) {
  console.log("this request is from user");
  trashCan.trashcanList(req, res);
});

//문의
// GET 'QnA list'
app.get('/qna', function (req, res) {
  console.log("this request is from user");
  qna.qnaList(req, res);
});
// GET '{qna_num} detail'
app.get('/qna/:qna_num', function (req, res) {
  console.log("this request is from user");
  qna.qnaDetail(req, res);
});
// POST 'NEW QnA'
app.post('/qna', function (req, res) {
  console.log("this request is from user");
  qna.qnaSubmit(req, res);
});


app.listen(port, () => {
  console.log("Start Listening ------")
});