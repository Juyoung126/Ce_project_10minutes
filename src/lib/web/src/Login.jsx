import React, { useState } from 'react';
import { useContext } from 'react';
import { Link, Navigate, useNavigate, BrowserRouter, Routes, Route } from 'react-router-dom';
import { LoginContext } from './App';
import "./Login.css";
import "./App.css";

function LoginForm() {
  const [id, setId] = useState('');
  const [passwd, setPasswd] = useState('');
  const navigate = useNavigate();
  const { isLoggedIn, setIsLoggedIn } = useContext(LoginContext);

  const handleLogin = async (event) => {
    event.preventDefault();
    const response = await fetch('http://ceprj.gachon.ac.kr:60001/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Who': 'Admin'
      },
      body: JSON.stringify({ id, passwd })
    });
    if (response.ok) {
      // 로그인 성공
      // App의 props뭐시기 상태 ==> true 변경
      setIsLoggedIn(!isLoggedIn);
      navigate('/main');
    } else {
      alert('Login failed');
    }
  };

  return (
    <div className='loginPage-container'>
      <div className='login-box'>
        <img src={"logo_2.png"} alt="로고" className="loginpage-logo" />
        <div className="login-form-box">
          <form onSubmit={handleLogin} >
            <div className="login-input">
              <input type="text" id="username" value={id} onChange={(e) => setId(e.target.value)} name="id" placeholder="아이디" />
            </div>
            <div className="login-input">
              <input type="password" id="password" value={passwd} onChange={(e) => setPasswd(e.target.value)} name="passwd" placeholder="비밀번호" />
            </div>
            <button type="submit" className="admin-login-button">관리자 로그인</button>
          </form>
        </div>
        <Link to="/idPw" className="search-link">아이디/비번 찾기</Link>
      </div>
    </div>
  );
}
export default LoginForm;

// {/* <label htmlFor="username" >아이디:</label> */}
// <label htmlFor="password" >Password:</label>
