import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { LoginContext } from './App';

function Logout() {
  const [id, setId] = useState('');
  const navigate = useNavigate();
  const {isLoggedIn, setIsLoggedIn}=useContext(LoginContext);
  const response = fetch('http://ceprj.gachon.ac.kr:60001/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Who': 'Admin'
      },
      body: null
    }).then((res)=>{
      console.log("res", res); //response 확인
      if (res.ok) {
        console.log("response is okay.");
        // 로그아웃 성공
        // App의 props뭐시기 상태 ==> false 변경
        setIsLoggedIn(!isLoggedIn);
        navigate('/'); //로그인화면으로 redirect
      } else {
        console.log("response is not okay.failed");
        alert('Logout failed');
      }
      }
    );
    
  // 서버로부터 로그아웃 동작 (fetch 사용~~)
  // 서버로부터 response
  // 로그아웃 성공
  // App의 props뭐시기 상태 ==> false 변경
  // 로그인 화면 ('/')로 rediect
  return (
    <div>
      {/* 홈 */}
      <div className="home">
        <h2>This is Logout page</h2>
        {/* <FeaturedInfo />
        <Chart /> */}

      </div>
    </div>
  );
}

export default Logout;