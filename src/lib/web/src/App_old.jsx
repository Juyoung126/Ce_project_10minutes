// import { Router } from "express";
import React, { useState, useEffect } from "react";
// import { useNavigate } from 'react-router-dom';
import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";
import Main from "./Main";
import IdPw from "./IdPw";

const postLoginURL = "http://ceprj.gachon.ac.kr:60001/";
const getSearchURL = "http://ceprj.gachon.ac.kr:60001/idPw";
const getMainURL = "http://ceprj.gachon.ac.kr:60001/main";


function App() {

  console.log("Login Page for Admin  [in Login.jsx]");

  //----------------------------

  const [loginPageHTML, setLoginPageHTML] = useState(""); // 로그인 페이지 HTML을 저장할 상태(State)

  // const history = useHistory();
  // const navigate = useNavigate();

  useEffect(() => {
    // GET 요청 보내기
    fetch(postLoginURL)
      .then((response) => {
        // 로그인 실패 왜 두 번?
        if (response.ok) {
          return response.text(); // 응답 데이터를 텍스트로 파싱
        } else {
          throw new Error("로그인 페이지를 가져오는데 실패했습니다.");
        }
      })
      .then((html) => {
        // 가져온 HTML을 상태에 저장
        setLoginPageHTML(html);
      })
      .catch((error) => {
        console.error("GET 요청 실패: ", error);
        // 오류 처리 또는 사용자에게 오류 메시지 표시
      });
  }, []); // 빈 배열을 사용하여 컴포넌트가 마운트될 때 한 번만 실행

  //----------------------------

  const onLogin = (event) => {
    event.preventDefault(); // 화면 새로고침 방지
    const id = event.target.id.value;
    const passwd = event.target.passwd.value;
    console.log("post 전송");
    console.log("id: ", id);
    console.log("passwd: ", passwd);

    // POST 요청 보내기
    fetch(postLoginURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Who": "Admin",
      },
      body: JSON.stringify({ id, passwd }),
    })
      .then((response) => {
        if (response.ok) {
          return response.json(); // 응답 데이터를 JSON 형식으로 파싱
        } else {
          throw new Error("로그인에 실패했습니다.");
        }
      })
      .then((data) => {
        // 로그인 성공 시 처리
        console.log("로그인 성공!", data);
        // navigate('/idPw');

        //다음으로 넘어가도록 fetch 추가!!
        // <Navigate to="/main" />

        // Navigate("/main");
        return fetch(getMainURL, {
          headers: {
            "Content-Type": "application/json",
            "Who": "Admin",
          },
        })
        // navigate("/main");
      })
      .then((res) => {
        console.log("res", res);
        <Navigate to="/main" />
        // window.location.href = '/main';  // navigate to /main
      })
      .catch((error) => {
        // 로그인 실패 시 처리
        console.error("로그인 실패: ", error);
        // 오류 처리 또는 사용자에게 오류 메시지 표시
      });
  };

  // const onSearchIdPw = () => {
  //   // GET 요청 보내기
  //   fetch(getSearchURL)
  //     .then((response) => {
  //       if (response.ok) {
  //         // navigate('/idPw');

  //         // window.location.href = '/idPw';  // navigate to /idPw
  //         return response.json();
  //       } else {
  //         throw new Error("요청에 실패했습니다.");
  //       }
  //     })
  //     .then((data) => {
  //       // 데이터 성공적으로 받아왔을 때 처리
  //       console.log("데이터 받아오기 성공!", data);

  //       // 데이터를 사용하거나 화면을 업데이트할 수 있습니다.
  //     })
  //     .catch((error) => {
  //       // 요청 실패 시 처리
  //       console.error("데이터 받아오기 실패: ", error);
  //       // 오류 처리 또는 사용자에게 오류 메시지 표시
  //     });
  // }

  return (
    <div>
      <div>
        <BrowserRouter>
          <Routes>
            <Route path="/main" element={<Main />} />
            <Route path="/idPw" element={<IdPw />} />
          </Routes>
        </BrowserRouter>
      </div>
      <div>
        <h2>관리자 로그인 페이지</h2>

        <form onSubmit={onLogin}>
          <label>ID : </label>
          <input type="text" name="id" />
          <br />
          <label>PW : </label>
          <input type="password" name="passwd" />
          <br />
          <button type="submit">로그인</button>
        </form>

        <div>
          {/* <button type="button" onClick={onSearchIdPw}>
            아이디/비밀번호 찾기
          </button> */}
          <Link to="/idPw">아이디/비번 찾기</Link>
        </div>
        <p></p>
      </div>
    </div>
  );
}


export default App;

// import React from "react";
// import Main from "./Main";

// import { BrowserRouter, Routes, Route } from "react-router-dom";

// function App() {

//   return (
//     <div>
//       <div>
//         <div>
//           <h1>Success...???</h1>
//         </div>
//         <form className="login input">
//           <h1>THIS is the first page</h1>
//           x``
//           <input type="text" id="id" label="아이디"></input><br />
//           <input type="text" id="passwd" label="비밀번호"></input><br />
//           <button className="login-button" type="submit">로그인</button><br />
//         </form>
//         <button className="id-pw-button" type="submit">아이디/비밀번호 찾기</button>
//       </div>
//       <BrowserRouter>
//         <Routes>
//           <Route path="/main" element={<Main />} />
//         </Routes>
//       </BrowserRouter>
//     </div>
//   )
// }


//export default App;