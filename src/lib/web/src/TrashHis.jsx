import React from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Link } from 'react-router-dom';
import { useState } from "react";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

function formatDate(dateString) {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function TrashHis() {
  const [tableData, setTableData] = useState([]);
  const navigate = useNavigate();
  const { user_num } = useParams();


  const serverURL = `http://ceprj.gachon.ac.kr:60001/users/${user_num}/trashHis`;
  const columns = [
    { field: "id", headerName: "분류 번호", width: 120 },
    { field: "date", headerName: "날짜", width: 120 },
    { field: "feed_star", headerName: "별점", width: 50 },
    { field: "feed_contents", headerName: "피드백 내용", width: 200 },
    {
      field: "img_bf",
      headerName: "분류 전",
      width: 180,
      renderCell: (params) => (
        <div>
          {params.value && (
            <>
              <img src={`data:image/jpeg;base64,${params.value}`} alt="분류 전 이미지" style={{ height: '50px' }} />
            </>
          )}
        </div>
      )
    },
    {
      field: "classified",
      headerName: "분류 결과",
      width: 180,
      renderCell: (params) => (
        <div>
          {params.value && (
            <>
              <img src={`data:image/jpeg;base64,${params.value}`} alt="분류 결과 이미지" style={{ height: '50px' }} />
            </>
          )}
        </div>
      )
    },
    { field: "types_count", headerName: "분류 개수", width: 50 },
    { field: "nonZeroProperties", headerName: "분류 결과", width: 200 },
  ];

  useEffect(() => {
    fetch(serverURL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Who': 'Admin'
      }
    })
      .then((response) => response.json())
      .then((data) => {
        const sortedData = data.sort((a, b) => new Date(b.date) - new Date(a.date));
        const processedData = sortedData.map((row, index) => ({
          ...row,
          order: index + 1,
          date: formatDate(row.date),
        }));

        setTableData(processedData);
      })
      .catch((error) => {
        console.error('데이터를 가져오는 중 오류 발생:', error);
      })
  }, [user_num]);

  console.log(tableData)

  return (
    <div>
      <div className="userlist">
        <h2>개인별 분리배출 기록</h2>
      </div>
      <DataGrid
        rows={tableData}
        disableSelectionOnClick
        columns={columns}
        pageSize={10}
        rowsPerPageOptions={[5]}
        sortModel={[
          {
            field: 'date',
            sort: 'desc',
          },
        ]}
      />
      <button className="post-view-go-list-btn" onClick={() => navigate(`/users/${user_num}`)}>유저 정보로 돌아가기</button>
    </div>
  );
}

export default TrashHis;