import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function ManualAdd() {
  const serverURL = "http://ceprj.gachon.ac.kr:60001/manual/:manual_num/editing";
  //URI 파라미터 가져오기
  const { manual_num } = useParams();
  //매뉴얼 대분류, 소분류, 내용
  const [types, setTypes] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    fetch(serverURL), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        'Who': 'Admin'
      },
      body: JSON.stringify({
        types: types,
        title: title,
        content: content,
      }),
    }
      .then((data) => data.json())
      .then((data) => console.log(data));
  })

  return (
    <div className="NewManualPage">
      <div className="NewManual">
        <h2>매뉴얼 수정하기</h2>
      </div>
      <label>
        대분류:
        <input type="text" value={types} onChange={(e) => setTypes(e.target.value)} name="types" />
      </label>
      <label>
        소분류:
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} name="title" />
      </label>
      <label>
        내용:
        <input type="text" value={content} onChange={(e) => setContent(e.target.value)} name="content" />
      </label>
      <button type="submit">수정하기</button>
    </div>
  )
}

export default ManualAdd;