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
import NewAnimal from "./NewAnimal";
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

          <div className="sidebar">
            <div className="container-fluid">
              <div className="row flex-nowrap">
                <div className="col-auto col-md-3 col-xl-2 px-sm-2 px-0 bg-dark">
                  <div className="d-flex flex-column align-items-center align-items-sm-start px-3 pt-2 text-white min-vh-100">
                    <Link to="/main" className="d-flex align-items-center pb-3 mb-md-0 me-md-auto text-white text-decoration-none">
                      <img src={logo} alt="로고" />
                    </Link>
                    {/* <a href="/" className="d-flex align-items-center pb-3 mb-md-0 me-md-auto text-white text-decoration-none">
                      <span className="fs-5 d-none d-sm-inline">Menu</span>
                    </a> */}
                    <ul className="nav nav-pills flex-column mb-sm-auto mb-0 align-items-center align-items-sm-start" id="menu">
                      <li className="nav-item">
                        <Link to="/main" className="nav-link align-middle px-0">
                          <i className="fs-4 bi-house"></i>
                          <span className="ms-1 d-none d-sm-inline">
                            홈 화면
                          </span>
                        </Link>
                      </li>
                      <li>
                        <a href="#" data-bs-toggle="collapse" className="nav-link px-0 align-middle">
                          <i className="fs-4 bi-speedometer2"></i> <span className="ms-1 d-none d-sm-inline">사용자 관리</span> </a>
                        <ul className="collapse show nav flex-column ms-1" id="submenu1" data-bs-parent="#menu">
                          <li className="w-100">
                            <Link to="/users" className="nav-link px-0"> <span className="d-none d-sm-inline">회원 관리</span> U </Link>
                          </li>
                          <li>
                            <Link to="/qna" className="nav-link px-0"> <span className="d-none d-sm-inline">회원 문의 관리</span> Q </Link>
                          </li>
                        </ul>
                      </li>
                      <li>
                        <li>
                          <a href="#" data-bs-toggle="collapse" className="nav-link px-0 align-middle">
                            <i className="fs-4 bi-speedometer2"></i> <span className="ms-1 d-none d-sm-inline">데이터베이스 관리</span> </a>
                          <ul className="collapse show nav flex-column ms-1" id="submenu2" data-bs-parent="#menu">
                            <li className="w-100">
                              <Link to="/users" className="nav-link px-0"> <span className="d-none d-sm-inline">분리배출 매뉴얼 관리</span> M </Link>
                            </li>
                            <li>
                              <Link to="/traschcan" className="nav-link px-0"> <span className="d-none d-sm-inline">공공쓰레기통 위치 관리</span> T </Link>
                            </li>
                            <li>
                              <Link to="/animal" className="nav-link px-0"> <span className="d-none d-sm-inline">동물 캐릭터 관리</span> A </Link>
                            </li>
                            <li>
                              <Link to="/store" className="nav-link px-0"> <span className="d-none d-sm-inline">상점 관리</span> S </Link>
                            </li>
                          </ul>
                        </li>
                        <li>
                          <a href="#" className="nav-link px-0 align-middle">
                            <i className="fs-4 bi-table"></i> <span className="ms-1 d-none d-sm-inline">AI 관리</span></a>
                        </li>
                        <li>
                          <Link to="/admins" className="nav-link px-0 align-middle"><i className="fs-4 bi-table"></i> <span className="ms-1 d-none d-sm-inline">관리자 관리</span></Link>
                        </li>
                      </li>
                    </ul>
                    <div>
                      <div className="dropdown pb-4">
                        <a href="#" className="d-flex align-items-center text-white text-decoration-none dropdown-toggle"
                          id="dropdownUser1" data-bs-toggle="dropdown" aria-expanded="false">
                          <img src="logo.png" alt="hugenerd" width="30" height="30" className="rounded-circle" />
                          <span className="d-none d-sm-inline mx-1">admin</span>
                        </a>
                        <ul className="dropdown-menu dropdown-menu-dark text-small shadow" aria-labelledby="dropdownUser1">
                          <li><Link to="myinfo" className="dropdown-item">내 정보 수정</Link></li>
                          <li>
                            {/* <hr className="dropdown-divider"></hr> */}
                          </li>
                          <li><Link to="/logout" className="dropdown-item">로그아웃</Link></li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="col py-3">
                    <h3>10분: 10고빠른 분리배출</h3>
                    <p className="lead">
                      An example 2-level sidebar with collasible menu items. The menu functions like an "accordion" where only a
                      single
                      menu is be open at a time. While the sidebar itself is not toggle-able, it does responsively shrink in width on
                      smaller screens.</p>
                    <ul className="list-unstyled">
                      <li>
                        <h5>Responsive</h5> shrinks in width, hides text labels and collapses to icons only on mobile
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="route">
                <Routes>
                  <Route path="/" element={<LoginForm />} />
                  <Route path="/idPw" element={<IdPw />} />
                  <Route path="/newPasswd" element={<NewPasswd />} />
                  <Route path="/main" element={<Main />} />
                  <Route path="/myinfo" element={<Myinfo />} />
                  <Route path="/passwdAuth" element={<PasswdAuth />} />
                  <Route path="/logout" element={<Logout />} />
                  <Route path="/users" element={<User />} />
                  <Route path="/qna" element={<QnA />} />
                  <Route path="/manual" element={<Manual />} />
                  <Route path="/manual/newManual" element={<NewManual />} />
                  <Route path="/trashcan" element={<Trashcan />} />
                  <Route path="/animal" element={<Animal />} />
                  <Route path="/newAnimal" element={<NewAnimal />} />
                  <Route path="/store" element={<Store />} />
                  <Route path="/ai" element={<AI />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/newpasswd" element={<NewPasswd />} />
                  <Route path="/manual/:manual_num" element={<ManualDetail />} />
                </Routes>
              </div>
            </div>
          </div>
        </BrowserRouter>
      </LoginContext.Provider>
    )
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
          </BrowserRouter >
        </LoginContext.Provider >
      </div>
    );
  }
}


export default App;