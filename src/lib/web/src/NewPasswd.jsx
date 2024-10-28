import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function NewPasswd() {
  const [newPw, setNewPw] = useState('');
  const [newPwRepeat, setNewPwRepeat] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleNewPassword = (e) => {
    e.preventDefault();
    // passwords are same.   (입력한 비밀번호가 서로 일치)
    console.log("\n>>> this is in NewPasswd.jsx <<<<<<");
    console.log("newPw: ", newPw);
    console.log("newPwRepeat: ", newPwRepeat);
    if (newPw === newPwRepeat) {
      fetch('/newPasswd', {
        method: 'PATCH',
        body: JSON.stringify({ newPw }),
        headers: {
          'Content-Type': 'application/json',
          'Who': 'Admin'
        }
      })
        .then(res => {
          // 비밀번호 변경 성공
          if (res.status === 200) {
            // console.log("(in NewPasswd.jsx) res.json(): ", res.json());
            return res.json();
          } else {
            throw new Error('비밀번호 변경에 실패했습니다.');
          }
        })
        .then(data => {
          console.log('(in NewPasswd.jsx) data: ', data);

          // you did login before!!  - from change Information   (새 비밀번호가 등록이 완료됐고, 로그인이 되어 있음) 
          if (!(data === undefined)) {
            navigate('/myinfo');
          }
          // now you can login!!  - from find Password   (새 비밀번호가 등록이 완료됐으나, 로그인 해야 함.) 
          else if ((data === undefined)) {
            navigate('/');
          }
          else {
            setError(data.error);
          }
        })
        .catch(error => {
          setError(error.message);
        });
    }
  }

  return (
    <div>
      <div className="home">
        <h2>THIS IS New Passwd Page</h2>
      </div>
      <form onSubmit={handleNewPassword} name="newPasswd">
        <div>
          <label>
            new password:
            <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} />
          </label>
          <label>
            new password (repeat):
            <input type="password" value={newPwRepeat} onChange={(e) => setNewPwRepeat(e.target.value)} />
          </label>
          {error && <p>{error}</p>}
          <button type="submit">Save New Password</button>
        </div>
      </form>
    </div >
  );
}

export default NewPasswd;
