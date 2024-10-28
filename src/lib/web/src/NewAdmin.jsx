import { deprecatedPropType } from "@mui/material";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./All.css";

function NewAdmin() {
  const [name, setName] = useState('');
  const [id, setId] = useState('');
  const [passwd, setPasswd] = useState('');
  const [birth, setBirth] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [isChecked, setIsChecked] = useState(false);
  const [isAuth, setIsAuth] = useState('N');
  const navigate = useNavigate();


  const handleNewAdmin = (e) => {
    e.preventDefault();
    fetch("http://ceprj.gachon.ac.kr:60001/admins/newAdmin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        'Who': 'Admin'
      },
      body: JSON.stringify({
        name: name,
        id: id,
        passwd: passwd,
        birth: birth,
        email: email,
        department: department,
        isAuth: isAuth,
      }),
    })
      // .then((response) => console.log(response))
      .then(response => {
        if (response.ok) { //데이터 추가가 성공했을 경우
          navigate('/admins');
        }
        else {
          throw new Error('데이터 추가에 실패했습니다.');
        }
      })
  }

  const handleCheckboxChange = (e) => {
    setIsChecked(e.target.checked);
    setIsAuth(e.target.checked ? 'Y' : 'N');
  }

  return (
    <div className="NewAdminPage">
      <div className="NewAdmin">
        <h2>관리자 추가하기</h2>
      </div>
      <form onSubmit={handleNewAdmin} name="newAdmin">
        <label>
          이름:
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} name="name" />
        </label>
        <label>
          아이디:
          <input type="text" value={id} onChange={(e) => setId(e.target.value)} name="id" />
        </label>
        <label>
          비밀번호:
          <input type="password" value={passwd} onChange={(e) => setPasswd(e.target.value)} name="passwd" />
        </label>
        <label>
          생년월일:
          <input type="text" value={birth} onChange={(e) => setBirth(e.target.value)} name="birth" />
        </label>
        <label>
          이메일:
          <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} name="email" />
        </label>
        <label>
          부서:
          <input type="text" value={department} onChange={(e) => setDepartment(e.target.value)} name="department" />
        </label><br />
        <label>
          <input type="checkbox" checked={isChecked} onChange={handleCheckboxChange} />
          슈퍼 관리자
        </label>
        <button type="submit">추가하기</button>
      </form>
    </div>
  );
}

export default NewAdmin;