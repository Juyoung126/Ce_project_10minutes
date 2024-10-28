const cors = require('cors');
const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const port = 60001;   // port number
// const methodOverride = require('method-override')

// for upload file
const multer = require('multer');

const { qnaSubmit, upload } = require('./controller/user/qnaRouter');
const { aiControl, upload2 } = require('./controller/admin/ai.js');
// for Common
var adminBegin = require('./controller/admin/admin_beginning.js');
var adminAccount = require('./controller/admin/admin_account.js');
var userAuthRouter = require('./controller/user/userAuthRouter.js');
const mobileMain = require('./controller/user/mobileMainRouter.js');
const userMypage = require('./controller/user/myPageRouter.js');
// for Admin
var adminUsers = require('./controller/admin/admin_users.js');
var adminQna = require('./controller/admin/admin_qna.js');
var adminManual = require('./controller/admin/admin_manual.js');
var adminTrashcan = require('./controller/admin/admin_trashcanDB');
var adminAI = require('./controller/admin/admin_AI.js');
var adminAdmin = require('./controller/admin/admin_admin');

// for User
const trashManual = require('./controller/user/manualRouter.js');
const qna = require('./controller/user/qnaRouter.js');
const feedback = require('./controller/user/feedbackRouter.js');
const map = require('./controller/user/mapRouter.js')

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'view/web/build')));    // for 리액트 index.html
// app.get('/*', function (req, res) {
//   res.sendFile(path.join(__dirname, 'view/web/build', 'index.html'));
// });
app.use(bodyParser.urlencoded({ extended: false }));
// app.use(methodOverride('_method'))


// 세션 (for Admin) ========================================================
var session = require('express-session');
const { allowedNodeEnvironmentFlags } = require('process');
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

// // 'login Page' (로그인 화면)
// app.get('/', function (req, res) {
//   console.log("this request is from admin")
//   adminAccount.loginPage(req, res);
// });
// // 'login' (로그인하기)
// app.post('/', function (req, res) {
//   const who = req.header('Who');
//   console.log("[POST /] - [Login] - HEADER: ", who)

//   if ((req.session.is_admin) || (who === 'Admin')) {
//     console.log("this request is from admin")
//     adminAccount.login(req, res);
//   }
//   else {
//     console.log("this request is from user")
//     userAuthRouter.login(req, res);
//   }
// });

// 'start Page' (초기 화면)
app.get('/', function (req, res) {
  console.log("this request is from admin")
  adminBegin.firstPage(req, res);
});
app.get('/appDownload', function (req, res) {
  console.log("this request is from admin")
  adminBegin.appDownload(req, res);
});
// 'login' (로그인하기)
app.post('/', function (req, res) {
  console.log("this request is from user")
  userAuthRouter.login(req, res);
});
// 'login Page' (로그인 화면)
app.get('/login', function (req, res) {
  console.log("this request is from admin")
  adminBegin.loginPage(req, res);
});
// 'login' (로그인하기)
app.post('/login', function (req, res) {
  console.log("this request is from admin")
  adminBegin.login(req, res);

});
// 'Logout'   (로그아웃하기)
app.post('/logout', function (req, res) {
  const who = req.header('Who');
  console.log("[from Admin Logout] - HEADER: ", who);
  if ((req.session.is_admin) || (who === 'Admin')) {
    console.log("this [Logout] request is from admin")
    adminBegin.logout(req, res);
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

  if ((req.session.is_admin) || (who === 'Admin')) {
    console.log("this request is from admin")
    adminBegin.mainPage(req, res);
  }
  else {
    console.log("this request is from user")
    mobileMain.getMain(req, res);
  }
});
// find id & pw   (아이디/비번 찾기 화면)
app.get('/idPw', function (req, res) {
  adminBegin.idPwPage(req, res);
});
// verify Email  (아이디/비밀번호 찾기 전 이메일 인증)
app.post('/verify', function (req, res) {
  const who = req.header('Who');
  console.log("HEADER: ", who)

  if ((req.session.is_admin) || (who === 'Admin')) {
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

  if ((req.session.is_admin) || (who === 'Admin')) {
    console.log("this request is from admin")
    adminAccount.id(req, res);
  }
  else {
    console.log("this request is from user")
    userAuthRouter.id(req, res);
  }
});
// make a new pw page  (새 비밀번호 만들기 화면)
app.get('/newPasswd', function (req, res) {
  adminAccount.newPasswdPage(req, res);
});
// make a new pw  (새 비밀번호 만들기)
app.patch('/newPasswd', function (req, res) {
  const who = req.header('Who');
  console.log("HEADER: ", who)

  if ((req.session.is_admin) || (who === 'Admin')) {
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
app.post('/emailAuth', function (req, res) {
  userAuthRouter.emailAuth(req, res);
});
// delete account (only for app)  (회원 탈퇴)
app.delete('/account', function (req, res) {
  const who = req.header('Who');
  console.log("HEADER: ", who);
  if ((req.session.is_admin) || (who === 'Admin')) {
    console.log("this request is from admin")
    // adminAccount.mainPage(req, res);
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

  if ((req.session.is_admin) || (who === 'Admin')) {
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
  const who = req.header('Who');
  console.log("HEADER: ", who);
  if ((req.session.is_admin) || (who === 'Admin')) {
    console.log("this request is from admin")
    adminAccount.passwdAuth(req, res);
  }
  else {
    console.log("this request is from user");
    userMypage.passwdAuth(req, res);
  }
});
// Update User's Information  (only for app) (사용자 개인정보 수정)
app.patch('/myinfo', function (req, res) {
  userMypage.userinfoChange(req, res);
});


// 사용자 문의 게시판
// GET 'QnA list page'   (사용자 문의 목록 화면)
app.get('/qna', function (req, res) {
  const who = req.header('Who');
  console.log("HEADER: ", who);
  if ((req.session.is_admin) || (who === 'Admin')) {
    console.log("this request is from admin  (QnA List Page");
    adminQna.qnaList(req, res);
  }
  else {
    console.log("this request is from user  (QnA List Page");
    qna.qnaList(req, res);
  }
})
// GET 'QnA list page'   (사용자 문의 상세 화면)
app.get('/qna/:qna_num', function (req, res) {
  const who = req.header('Who');
  console.log("HEADER: ", who);
  if ((req.session.is_admin) || (who === 'Admin')) {
    console.log("this request is from admin  (QnA List Page");
    adminQna.qnaDetailPage(req, res);
  }
  else {
    console.log("this request is from user  (QnA List Page");
    qna.qnaDetail(req, res);
  }
})

// 공공 쓰레기통 위치 
// GET 'trashCan list'
app.get('/trashcan', function (req, res) {
  const who = req.header('Who');
  console.log("HEADER: ", who);
  if ((req.session.is_admin) || (who === 'Admin')) {
    console.log("this request is from admin (trashcan List Page)");
    adminTrashcan.trashcanList(req, res);
  }
});


// AI 관리
const ai = require('./controller/admin/ai.js');
const { error } = require('console');
// GET AI Page
app.get('/aiManage', function (req, res) {
  const who = req.header('Who');
  console.log("HEADER: ", who);
  // if ((req.session.is_admin) || (who === 'Admin')) {
  console.log("this request is from admin (AI Management Page)");
  adminAI.aiManagePage(req, res);
  // }
})
app.post('/aiManage/change', function (req, res) {
  console.log("this request is from admin (AI Management Page)");
  adminAI.aiChange(req, res);
})
// app.post('/aiManage/upload', function (req, res) {
//   console.log("this request is from admin (AI Management Page)");
//   adminAI.aiUpload(req, res);
// })
app.post('/aiManage/training', function (req, res) {
  console.log("this request is from admin (AI Management Page)");
  adminAI.aiTraining(req, res);
})


app.post('/ai', function (req, res) {
  const who = req.header('Who');
  console.log("HEADER: ", who);
  if ((req.session.is_admin) || (who === 'Admin')) {
    console.log("this request is from admin (AI Management Page)");
    // adminAI.aiPage(req, res);
  }
  else {
    console.log("this request is from user (AI Page)");
    upload2.single('inputImage')(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        // multer에서 오류가 발생했을 경우 처리
        console.log('Multer error:', err.message);
        return res.status(500).json({ text: 'Post AI error', error: err.message });
      } else if (err) {
        // 알 수 없는 오류가 발생했을 경우 처리
        console.log('Unknown error:', err);
        return res.status(500).json({ error: 'An unknown error occurred when uploading.' });
      }

      // multer가 성공적으로 파일을 처리하면 qnaSubmit 함수를 수동으로 호출합니다.
      aiControl(req, res);
    });
  }
})

app.get('/aiResult/:class_num', function (req, res) {
  console.log("this request is from user");
  ai.aiResult(req, res);
})





// =======================================================================
// =======================================================================
// <------------------------ Server for Admin --------------------------->
// =======================================================================
// 사용자 관리 >>>>>>>>>>>>>>>>
// 사용자 리스트 화면
app.get('/users', function (req, res) {
  console.log("this request is from Admin");
  adminUsers.userList(req, res);
});
// 사용자 개인 정보 디테일 화면
app.get('/users/:user_num', function (req, res) {
  console.log("this request is from Admin");
  adminUsers.userDetail(req, res);
});
// 사용자 정보 삭제
app.delete('/users/:user_num', function (req, res) {
  console.log("this request is from Admin");
  adminUsers.userDelete(req, res);
});
// 사용자 개인 분리배출 히스토리 조회
app.get('/users/:user_num/trashHis', function (req, res) {
  console.log("this request is from Admin");
  adminUsers.userTrash(req, res);
});



// 사용자 문의 관리 >>>>>>>>>>>>>>>>>>
// GET List & Detail 부분은 Common Part에 있음.
// GET 'QnA list page'   (사용자 문의 답변 등록 및 수정 화면)
app.get('/qna/:qna_num/reply', function (req, res) {
  console.log("this request is from admin  (QnA List Page");
  adminQna.qnaReplyPage(req, res);
})
// POST 'QnA list page'   (사용자 문의 답변 등록 및 수정)
app.patch('/qna/:qna_num/reply', function (req, res) {
  console.log("this request is from admin  (QnA List Page");
  adminQna.qnaReply(req, res);
})
// DELETE 'QnA list page'   (사용자 문의 답변 삭제)
app.patch('/qna', function (req, res) {
  console.log("this request is from admin  (QnA List Page");
  adminQna.qnaReplyDelete(req, res);
})


// 매뉴얼 관리 >>>>>>>>>>>>>>>>>>
// GET 'manual'   (매뉴얼 리스트)
app.get('/manual', function (req, res) {
  console.log("this request is from admin (manualList)");
  adminManual.manualList(req, res);
});
// GET 'new manual page'    (새 매뉴얼 등록 화면)
app.get('/manual/newManual', function (req, res) {
  console.log("this request is from admin (new Manual Create Page)");
  adminManual.newManualPage(req, res);
});
// POST 'new manual'  (새 메뉴얼 등록 요청)
app.post('/manual/newManual', function (req, res) {
  console.log("this request is from admin (new Manual Create)");
  adminManual.newManual(req, res);
});
// GET 'manual deail page for manual_num'  (메뉴얼 상세페이지 화면)
app.get('/manual/:manual_num', function (req, res) {
  console.log("this request is from admin (manual Detail Page)");
  adminManual.manualDetailPage(req, res);
});
// GET 'manual deail update page for manual_num'  (메뉴얼 상세페이지 수정 화면)
app.get('/manual/:manual_num/editing', function (req, res) {
  console.log("this request is from admin (manual Detail Update Page)");
  adminManual.manualDetailEditPage(req, res);
});
// PUT 'manual deail update for manual_num'  (메뉴얼 상세페이지 수정 요청)
app.put('/manual/:manual_num/editing', function (req, res) {
  console.log("this request is from admin (manual Detail Update)");
  adminManual.manualDetailEdit(req, res);
});
// DELETE 'manual deail delete for manual_num'  (메뉴얼 상세페이지 삭제 요청)
app.delete('/manual/:manual_num', function (req, res) {
  console.log("this request is from admin (manual Detail Delete)");
  adminManual.manualDetailDelete(req, res);
});


// ==========================================================
// 공공 쓰레기통 위치 데이터 관리 >>>>>>>>>>>>>>>>>>>>>
// GET 'trashcan location'   (쓰레기통 위치 리스트)
app.get('/trashcan', function (req, res) {
  console.log("this request is from admin (trashcan List Page)");
  adminTrashcan.trashcanList(req, res);
});
// PUT 'trashcan location update'  (공꽁 쓰레기통 위치 상세 화면)
app.get('/trashcan/:town_num', function (req, res) {
  console.log("this request is from admin (trashcan Update Page)");
  adminTrashcan.trashcanDetailPage(req, res);
});
// GET 'new trashcan location page'    (새 쓰레기통 위치 등록 화면)
app.get('/trashcan/newTrashcan', function (req, res) {
  console.log("this request is from admin (NEw trashcan Create Page)");
  adminTrashcan.newTrashcanPage(req, res);
});
// POST 'new trashcan location'  (새 쓰레기통 위치 등록 요청)
app.post('/trashcan/newTrashcan', function (req, res) {
  console.log("this request is from admin (trashcan List Create)");
  adminTrashcan.newTrashcan(req, res);
});
// GET 'trashcan location update page'  (공꽁 쓰레기통 위치 수정 화면)
app.get('/trashcan/:town_num/:trashcan_num/editing', function (req, res) {
  console.log("this request is from admin (trashcan Update Page)");
  adminTrashcan.trashcanUpdatePage(req, res);
});
// PUT 'trashcan location update'  (공꽁 쓰레기통 위치 수정)
app.put('/trashcan/:town_num/:trashcan_num', function (req, res) {
  console.log("this request is from admin (trashcan Update)");
  adminTrashcan.trashcanUpdate(req, res);
});
// DELETE 'trashcan location delete'  (공꽁 쓰레기통 위치 삭제 요청)
app.delete('/trashcan/:town_num/:trashcan_num', function (req, res) {
  console.log("this request is from admin (trashcan Delete)");
  adminTrashcan.trashcanDelete(req, res);
});


// AI 결과 및 피드백 >>>>>>>>>>>>>>>>>>
// GET 'AI Result & Feedback Page'   (AI 전체 분류 결과 및 피드백 화면)
app.get('/feedback', function (req, res) {
  const who = req.header('Who');
  console.log("HEADER: ", who);
  if ((req.session.is_admin) || (who === 'Admin')) {
    console.log("this request is from admin");
    adminAI.feedbackPage(req, res);
    // adminUsers.feedbackPage(req, res);
  }
})
// GET 'Download Image'
app.get('/download/:image_name', function (req, res) {
  console.log("this request is from admin  (GET image)");
  adminAI.downloadImage(req, res);
  // adminUsers.downloadImage(req, res);
})

// // GET 'Image'  -----?  과연 필요할까요?
// app.get('/image/:image_name', function (req, res) {
//   console.log("this request is from admin  (GET image)");
//   adminUsers.image(req, res);
// })
// // GET 'Download Image'
// app.get('/image/:image_name/download', function (req, res) {
//   console.log("this request is from admin  (GET image)");
//   adminUsers.downloadImage(req, res);
// })


// 슈퍼 관리자 >>>>>>>>>>>>>>>>>>>>>
// GET 'Admin List'  (only for authoritative person)   (권한O - 관리자들 목록 화면)
app.get('/admins', function (req, res) {
  console.log("this request is from admin");
  adminAdmin.adminsPage(req, res);
  // adminUsers.adminsPage(req, res);
});
// GET 'New Admin'  (only for authoritative person)   (권한O - 새 관리자 등록 화면)
app.get('/admins/newAdmin', function (req, res) {
  console.log("this request is from admin");
  adminAdmin.newAdmin(req, res);
  // adminUsers.newAdmin(req, res);
})
// POST 'Admin's Detail  (only for authoritative person)   (권한O - 새 관리자 등록)
app.post('/admins/newAdmin', function (req, res) {
  console.log("this request is from admin");
  adminAdmin.newAdmin(req, res);
  // adminUsers.newAdmin(req, res);
});
// GET 'Admin's Detail  (only for authoritative person)   (권한O - 관리자 정보 화면)
app.get('/admins/:admin_num', function (req, res) {
  console.log("this request is from admin");
  adminAdmin.adminDetailPage(req, res);
  // adminUsers.adminDetailPage(req, res);
});
// GET 'Admin's Detail  (only for authoritative person)   (권한O - 관리자 정보 수정 화면)
app.get('/admins/:admin_num/editing', function (req, res) {
  console.log("this request is from admin");
  adminAdmin.adminDetailUpdatePage(req, res);
  // adminUsers.adminDetailUpdatePage(req, res);
});
// PATCH 'Admin's Detail  (only for authoritative person)   (권한O - 관리자 정보 수정)
app.patch('/admins/:admin_num/editing', function (req, res) {
  console.log("this request is from admin");
  adminAdmin.adminDetailUpdate(req, res);
  // adminUsers.adminDetailUpdate(req, res);
});
// DELETE 'Admin's Detail  (only for authoritative person)   (권한O -관리자 정보 삭제)
app.delete('/admins/:admin_num', function (req, res) {
  console.log("this request is from admin");
  adminAdmin.adminDetailDelete(req, res);
  // adminUsers.adminDetailDelete(req, res);
});



// =======================================================================
// =======================================================================
// <------------------------- Server for User --------------------------->
// =======================================================================
// 사용자 회원가입 중 아이디 중복 확인
app.post('/checkId', function (req, res) {
  console.log("this request is from user");
  userAuthRouter.checkId(req, res);
})
// 사용자 메인 페이지
//GET 'user's Mypage'
app.get('/mypage', function (req, res) {
  console.log("this request is from user");
  userMypage.mypage(req, res);
});
// // GET 'user's info'
// app.get('/myInfo', function (req, res) {
//   console.log("this request is from user");
//   userMypage.userinfo(req, res);
// });

// // Patch 'user's info'
// app.patch('/myInfo', function (req, res) {
//   console.log("this request is from user");
//   userMypage.userinfoChange(req, res);
// });
//GET 'Character history'
// app.get('/petHistroy', function (req, res) {
//   console.log("this request is from user");
//   userMypage.pastPet(req, res);
// });
//GET 'classification history List'
app.get('/history', function (req, res) {
  console.log("this request is from user");
  userMypage.pastHistoryList(req, res);
});

//GET 'classification history '
app.get('/history/:class_num', function (req, res) {
  console.log("this request is from user");
  userMypage.pastHistory(req, res);
});

// 매뉴얼
// GET 'manual list'
app.get('/manualList', function (req, res) {
  console.log("this request is from user");
  trashManual.manual(req, res);
});
// GET '{manual_num} detail'
app.get('/manual/:manual_num', function (req, res) {
  console.log("this request is from user");
  trashManual.manualDetail(req, res);
});

// 공공쓰레기통 
app.post('/map', function (req, res) {
  console.log("this request is from user");
  map.trashcan(req, res);
})

//문의
// GET List & Detail 부분은 Common Part에 있음.
// POST 'NEW QnA'
app.post('/qna', function (req, res) {
  // console.log("this request is from user1");
  // qna.qnaSubmit(req, res);
  // 수정(추가)~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  upload.single('attached')(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      // multer에서 오류가 발생했을 경우 처리
      return res.status(500).json({ error: err.message });
    } else if (err) {
      // 알 수 없는 오류가 발생했을 경우 처리
      return res.status(500).json({ error: 'An unknown error occurred when uploading.' });
    }

    // multer가 성공적으로 파일을 처리하면 qnaSubmit 함수를 수동으로 호출합니다.
    qnaSubmit(req, res);
  });
});


// 피드백
app.patch('/feedback', function (req, res) {
  console.log("this request is from user");
  feedback.feedback(req, res);
})



app.listen(port, () => {
  console.log("Start Listening ------")
});