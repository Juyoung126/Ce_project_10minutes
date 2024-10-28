import React, { useState, useContext } from 'react';
import { Link, Navigate, useNavigate, BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginForm from "./Login";
import Main from "./Main";
import IdPw from "./IdPw";
import NewPasswd from "./NewPasswd";
import Myinfo from "./Myinfo";
import PasswdAuth from "./PasswdAuth";
import Logout from "./Logout";
import User from "./User";
import QnA from "./QnA";
import Manual from "./Manual";
import NewManual from './NewManual';
import ManualDetail from './ManualDetail';
import Trashcan from "./Trashcan";
import NewTrashcan from "./NewTrashcan";
import Animal from "./Animal";
import Store from "./Store";
import AI from "./AI";
import Admin from "./Admin";

import 'bootstrap/dist/css/bootstrap.min.css';
import logo from './logo.png';

export const LoginContext = React.createContext(null);

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  if (isLoggedIn) {
    return (
      <LoginContext.Provider value={{ isLoggedIn, setIsLoggedIn }}>
        <BrowserRouter>
          {/* 조건문: 로그인O => 보여주기..! 근데, 다른 쪽에서만!!!
          ==> isLoggedIn 변수 : 외부에서도 참조 가능하도록 ==> 아마 props?
        */}
          <div className="onlyForAdmin">
            <p>
              <div className='topbar'>
                <Link to="/main">로고_홈화면</Link><br />
                <Link to="/myinfo">내 정보 수정</Link><br />
                <Link to="/logout">로그아웃</Link><br />
              </div>
              <div className='sidebar'>
                <Link to="/user">회원 관리</Link><br />
                <Link to="/qna">회원 문의 관리</Link><br />
                <Link to="/manual">분리배출 매뉴얼 관리</Link><br />
                <Link to="/trashcan">공공쓰레기통 위치 관리</Link><br />
                <Link to="/animal">캐릭터 데이터 관리</Link><br />
                <Link to="/store">상점 데이터 관리</Link><br />
                <Link to="/ai">AI 관리</Link><br />
                <Link to="/admin">관리자 정보관리</Link>
              </div>
            </p>
          </div>
          <Routes>
            <Route path="/" element={<LoginForm />} />
            <Route path="/idPw" element={<IdPw />} />
            <Route path="/newPasswd" element={<NewPasswd />} />
            <Route path="/main" element={<Main />} />
            <Route path="/myinfo" element={<Myinfo />} />
            <Route path="/passwdAuth" element={<PasswdAuth />} />
            <Route path="/logout" element={<Logout />} />
            <Route path="/user" element={<User />} />
            <Route path="/qna" element={<QnA />} />
            <Route path="/manual" element={<Manual />} />
            <Route path="/manual/newManual" element={<NewManual />} />
            <Route path="/trashcan" element={<Trashcan />} />
            <Route path="/newTrashcan" element={<NewTrashcan />} />
            <Route path="/animal" element={<Animal />} />
            <Route path="/store" element={<Store />} />
            <Route path="/ai" element={<AI />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/newpasswd" element={<NewPasswd />} />
            <Route path="/manual/:manual_num" element={<ManualDetail />} />
          </Routes>
        </BrowserRouter>
      </LoginContext.Provider >
    );
  }
  else {
    return (
      <div className="LoginPage" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <LoginContext.Provider value={{ isLoggedIn, setIsLoggedIn }}>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LoginForm />} />
              <Route path="/idPw" element={<IdPw />} />
              <Route path="/newPasswd" element={<NewPasswd />} />
              <Route path="/main" element={<Main />} />
            </Routes>
          </BrowserRouter>
        </LoginContext.Provider>
      </div>
    );
  }
}

export default App;
