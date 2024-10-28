import React, { useState } from 'react';
import { useContext } from 'react';
import { Link, Navigate, useNavigate, BrowserRouter, Routes, Route } from 'react-router-dom';
import { LoginContext } from './App';

function LoginForm() {
  const [id, setId] = useState('');
  const [passwd, setPasswd] = useState('');
  const navigate = useNavigate();
  const { isLoggedIn, setIsLoggedIn } = useContext(LoginContext);

  const handleLogin = async (event) => {
    event.preventDefault();
    const response = await fetch('http://ceprj.gachon.ac.kr:60001/', {
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
    <div>
      <form onSubmit={handleLogin}>
        <label>
          Username:
          <input type="text" value={id} onChange={(e) => setId(e.target.value)} name="id" />
        </label>
        <br />
        <label>
          Password:
          <input type="password" value={passwd} onChange={(e) => setPasswd(e.target.value)} name="passwd" />
        </label>
        <br />
        <button type="submit">Login</button>
      </form>
      <Link to="/idPw">아이디/비번 찾기</Link>
    </div>

  );
}

export default LoginForm;
