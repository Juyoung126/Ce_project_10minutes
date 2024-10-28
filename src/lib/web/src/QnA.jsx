import React from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Link } from 'react-router-dom';
import { useState } from "react";
import { useEffect } from "react";
import "./All.css";
//import { manualList } from "../../../model/adminDB";

function formatDate(dateString) {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');

  return `${year}-${month}-${day}  ${hours}:${minutes}:${seconds}`;
}

function Qna() {
  const [tableData, setTableData] = useState([]);

  const serverURL = "http://ceprj.gachon.ac.kr:60001/qna";

  const columns = [
    { field: "id", headerName: "번호", width: 100 },
    { field: "category", headerName: "카테고리", width: 130 },
    { field: "title", headerName: "제목", width: 300 },
    {
      field: "date",
      headerName: "날짜",
      width: 200,
      renderCell: (params) => <span>{formatDate(params.row.date)}</span>, // 날짜를 포맷하여 렌더링
    },
    { field: "user_id", headerName: "문의자명", width: 100 },
    { field: "replied", headerName: "답변여부", width: 100 },
    {
      field: "action",
      headerName: "답변하기",
      width: 150,
      renderCell: (params) => {
        var qna_num = params.row.id;
        return (
          <>
            <Link to={`/qna/${qna_num}`} className="qnaListEdit">
              <button className="qnaListEdit">답변하기</button>
            </Link>
          </>
        );
      },
    },
  ];

  useEffect(() => {
    fetch(serverURL)
      .then((data) => data.json())
      .then((data) => {
        const formattedData = data.map((item) => ({
          ...item,
          date: formatDate(item.date), // 서버에서 받은 날짜를 formatDate 함수로 포맷
        }));
        setTableData(formattedData);
      });
  }, []);

  console.log(tableData)

  return (
    <div className="manualPage">
      <div className="manual">
        <h2>사용자 문의 관리 페이지</h2>
      </div>
      <DataGrid
        rows={tableData}
        disableSelectionOnClick
        columns={columns}
        pageSize={10}
        rowsPerPageOptions={[5]}
      />
    </div>
  );
}

export default Qna;