import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Myinfo() {
  const [myInfo, setMyInfo] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/myinfo', {

      headers: {
        'Content-Type': 'application/json',
        'Who': 'Admin'
      }
    })
      .then(response => response.json())
      .then(data => setMyInfo(data));
  }, []);

  if (!myInfo) {
    return <div>Loading...</div>;
  }

  const handleEditPassword = () => {
    navigate('/passwdAuth');
  }

  return (
    <div>
      <h1>My Info</h1>
      <p>Num: {myInfo.admin_num}</p>
      <p>Name: {myInfo.name}</p>
      <p>ID: {myInfo.id}</p>
      <p>Birth: {myInfo.birth}</p>
      <p>Email: {myInfo.email}</p>
      <p>Department: {myInfo.department}</p>
      <button onClick={handleEditPassword}>Edit Password</button>
    </div>
  );
}

export default Myinfo;


// import React from "react";
// import { useState } from 'react';


// function Myinfo() {
//   // const serverURL = "http://ceprj.gachon.ac.kr:60001/myinfo";

//   const [myinfoData, setmyinfoData] = useState(null);
//   const getmyinfoData = () => {
//     fetch('/myinfo', {

//       headers: {
//         'Content-Type': 'application/json',
//         'Who': 'Admin'
//       },
//     }
//       .then((res) => res.json())
//       .then((data) => {
//         setmyinfoData(data); // 데이터를 상태로 설정하는 부분을 then 내부에 이동
//         console.log(data); // 받은 데이터를 출력
//       })
//       .catch((error) => {
//         // 에러 처리
//         console.error('Fetch Error:', error);
//       }));
//     getmyinfoData();
//   };

//   return (
//     <div>
//       {/* 홈 */}
//       <div className="mypinfo">
//         <div className="myinfoTop">
//           <h2 className="myinfoTitle">관리자 상세페이지</h2>
//         </div>
//         <div className="myinfoContainer">
//           <div className="myinfoname">이름: {myinfoData.name}</div>
//           <div className="myinfoid">ID: {myinfoData.id}</div>
//           <div className="myinfobirth">생년월일: {myinfoData.birth}</div>
//           <div className="myinfoteam">부서: {myinfoData.team}</div>
//           <button className="myinfoButton" Link to="/myinfochceck">비밀번호 변경</button>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Myinfo;
