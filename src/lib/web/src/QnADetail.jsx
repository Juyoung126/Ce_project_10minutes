import React from "react";
import { useState } from "react";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Link } from 'react-router-dom';

function QnADetail() {
  // const serverURL = "http://ceprj.gachon.ac.kr:60001/qna/${qna_num}";
  const [tableData, setTableData] = useState([]);
  // const [tableData, setTableData] = useState({
  //     id: '',
  //     user_id: '',
  //     date: '',
  //     title: '',
  //     attached: '',
  //     contents: ''
  // });
  const { qna_num } = useParams();
  const navigate = useNavigate();
  //const { qna_num } = 1 //match.qna_num;

  useEffect(() => {
    //console.log("\nURL::::", `http://ceprj.gachon.ac.kr:60001/qna/${qna_num}`)
    fetch(`http://ceprj.gachon.ac.kr:60001/qna/${qna_num}`, {
      headers: {
        'Content-Type': 'application/json',
        'Who': 'Admin'
      }
    })
      .then((response) => response.json())
      .then((data) => {
        setTableData(data);
        console.log("tableData (in fetch process): ", tableData);
      })
      .catch(error => console.error('Error fetching data:', error));
  }, [qna_num]);

  console.log("\n===============\ntableData: ", tableData);
  console.log("tableData.id", tableData.id);

  return (
    <div>
      <h2 align="center">this is QnADetail page</h2>
      <div className="QnAdetailContainer">
        {/* {tableData.id && ( */}
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
            <label>카테고리</label>
            <label>{tableData.category}</label>
          </div>
          <div className="post-view-row">
            <label>제목</label>
            <label>{tableData.title}</label>
          </div>
          <div className="post-view-row">
            <label>내용</label>
            <label>{tableData.contents}</label>
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
            <label>답변</label>
            {tableData.reply ? (
              <label>{tableData.reply}</label>
            ) : (
              <label>답변이 없습니다.</label>
            )}
          </div>
        </div>
        {/* )} */}
        <Link to={`/qna/${qna_num}/reply`}>
          <button type="button">답변하기</button>
        </Link>
        <button className="post-view-go-list-btn" onClick={() => navigate('/qna')}>목록으로 돌아가기</button>
      </div>
    </div>
  )
}

export default QnADetail;