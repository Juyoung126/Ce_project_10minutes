import React from "react";
import { useState } from "react";
import { useEffect } from "react";
import { Navigate, useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Link } from 'react-router-dom';


function QnAReply() {
  // const serverURL = `http://ceprj.gachon.ac.kr:60001/qna/${qna_num}/reply`;
  const [tableData, setTableData] = useState([]);
  const { qna_num } = useParams();
  const [reply, setReply] = useState("");
  const navigate = useNavigate();


  useEffect(() => {
    fetch(`http://ceprj.gachon.ac.kr:60001/qna/${qna_num}/reply`, {
      headers: {
        "Content-Type": "application/json",
        'Who': 'Admin'
      }
    })
      .then((response) => response.json())
      .then((data) => {
        setTableData(data);
        setReply(data.reply || "");
        console.log("tableData (in fetch process): ", tableData);
        console.log("reply (in fetch process): ", reply);
        // console.log(tableData);
      })
      .catch(error => console.error('Error fetching data:', error));
  }, [qna_num]);

  const handleReplyChange = (event) => {
    setReply(event.target.value);
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch(`http://ceprj.gachon.ac.kr:60001/qna/${qna_num}/reply`, {    // 서버 엔드포인트로 변경해야 합니다.
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reply: reply }),
      });
      console.log("after fetch(PATCH)");

      if (response.status === 200) {
        navigate(`/qna/${qna_num}`);
      } else {
        // 오류 처리
        console.error('Server responded with an error:', response);
      }
    } catch (error) {
      console.error('Failed to send data:', error);
    }
  };

  return (
    <div>
      <h2 align="center">this is QnA Reply page</h2>
      <div className="QnAReplyContainer">
        <div className="post-view-wrapper">
          <div className="post-view-row">
            <label>번호</label>
            <label>{tableData.id}</label>
          </div>
          <div className="post-view-row">
            <label>회원 아이디</label>
            <label>{tableData.user_id}</label>
          </div>
          <div className="post-view-row">
            <label>날짜</label>
            <label>{tableData.date}</label>
          </div>
          <div className="post-view-row">
            <label>제목</label>
            <label>{tableData.title}</label>
          </div>
          <div className="post-view-row">
            <label>사진</label>
            {tableData.attached ? (
              <img src={`data:image/jpeg;base64,${tableData.attached}`} alt="첨부된 이미지" style={{ height: '50px' }} />
            ) : (
              <label>첨부된 이미지가 없습니다.</label>
            )}
          </div>
          <div className="post-view-row">
            <label>내용</label>
            <label>{tableData.contents}</label>
          </div>
          <div className="post-view-row">
            <label>답변</label>
            <input type="text" value={reply} onChange={handleReplyChange} />
          </div>
          <div className="post-view-row">
            <button onClick={handleSubmit}>답변 등록</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QnAReply;