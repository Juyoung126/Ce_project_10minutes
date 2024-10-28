import React, { useState } from "react";
import Myinfo from "./Myinfo";
import Logout from "./Logout";
import User from "./User";
import QnA from "./QnA";
import { Link, Navigate, useNavigate, BrowserRouter, Routes, Route } from 'react-router-dom';



function PasswdAuth() {
  const navigate = useNavigate();
  const [passwd, setPasswd] = useState('');

  const handleEditPassword = async (event) => {
    event.preventDefault();
    const response = await fetch('http://ceprj.gachon.ac.kr:60001/passwdAuth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Who': 'Admin'
      },
      body: JSON.stringify({ passwd })
    });
    if (response.ok) {
      navigate('/newPasswd');
    } else {
      alert('비밀번호가 일치하지 않습니다');
    }

  }

  return (
    <div>
      {/* 홈 */}
      <div className="home">
        <h2>THIS IS PasswdAuth Page</h2>
      </div>
      <div>
        <label>
          current passwd:
          <input type="password" value={passwd} onChange={(e) => setPasswd(e.target.value)} />
        </label>
        <button onClick={handleEditPassword}>check my password</button>
      </div>
    </div>
  );
}

export default PasswdAuth;
