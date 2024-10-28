import React, { useEffect } from "react";
import { useState } from "react";

function AdminUpdate() {
  const serverURL = "http://ceprj.gachon.ac.kr:60001/admins/:admin_num/editing";
  const [name, setName] = useState("");
  const [adminId, setAdminId] = useState("");
  const [department, setDepartment] = useState("");
  const [isUsed, setIsUsed] = useState("");
  const [isAuth, setIsAuth] = useState("");

  useEffect(() => {
    fetch(serverURL, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        'Who': 'Admin'
      },
      body: JSON.stringify({
        department: department,
        isUsed: isUsed,
        isAuth: isAuth,
      }),
    })
      .then((data) => data.json())
      .then((data) => console.log(data));
  })

  return (
    <div>
      <div className="NewManual">
        <h2>관리자 수정 화면</h2>
      </div>
      <label>
        이름:
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} name="name" />
      </label>
      <label>
        아이디:
        <input type="text" value={adminId} onChange={(e) => setAdminId(e.target.value)} name="adminId" />
      </label>
      <label>
        부서:
        <input type="text" value={department} onChange={(e) => setDepartment(e.target.value)} name="department" />
      </label>
      <label>
        재직 여부:
        <input type="text" value={isUsed} onChange={(e) => setIsUsed(e.target.value)} name="isUsed" />
      </label>
      <label>
        슈퍼관리자:
        <input type="text" value={isAuth} onChange={(e) => setIsAuth(e.target.value)} name="isAuth" />
      </label>
      <button type="submit">수정하기</button>
    </div>
  )
}

export default AdminUpdate;