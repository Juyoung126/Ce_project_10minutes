import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./All.css";

function NewManual() {
  const [types, setTypes] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const navigate = useNavigate();

  const handleNewManual = (e) => {
    e.preventDefault();
    fetch("http://ceprj.gachon.ac.kr:60001/manual/newManual", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        'Who': 'Admin'
      },
      body: JSON.stringify({
        types: types,
        title: title,
        content: content,
      }),
    })
      // .then((response) => console.log(response))
      .then(response => {
        if (response.ok) { //데이터 추가가 성공했을 경우
          navigate('/manual');
        }
        else {
          throw new Error('데이터 추가에 실패했습니다.');
        }
      })
  }

  return (
    <div className="NewManualPage">
      <div className="NewManual">
        <h2>매뉴얼 추가하기</h2>
      </div>
      <form onSubmit={handleNewManual} name="newManual">
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
        <button type="submit">추가하기</button>
      </form>
    </div>
  );
}

export default NewManual;