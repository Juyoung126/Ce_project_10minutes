import React from "react";
import { DataGrid } from "@mui/x-data-grid";
import { DeleteOutline } from "@mui/icons-material";
import { Link } from 'react-router-dom';
import { useState } from "react";
import { useEffect } from "react";
import "./All.css";
//import { manualList } from "../../../model/adminDB";

function Trashcan() {
  const [tableData, setTableData] = useState([]);

  const serverURL = "http://ceprj.gachon.ac.kr:60001/trashcan";
  // const [data, setData] = useState(tableData);

  // const handleDelete = (id) => {
  //     setData(data.filter((item) => item.id !== id));
  // };

  const columns = [
    { field: "town", headerName: "자치구명", width: 150 },
    { field: "street", headerName: "도로명", width: 170 },
    { field: "detail", headerName: "상세주소", width: 250 },
    { field: "placed", headerName: "위치", width: 200 },
    { field: "types", headerName: "종류", width: 200 },
    {
      field: "action",
      headerName: "상세보기",
      width: 150,
      renderCell: (params) => {
        var trashcan_num = params.row.id;
        return (
          <>
            <Link to={`/trashcan/${trashcan_num}`} className="trashcanEdit">
              <button className="trashcanEdit">상세보기</button>
            </Link>
            {/* <DeleteOutline
                            className="manualListDelete"
                            onClick={() => handleDelete(params.row.id)}
                        /> */}
          </>
        );
      },
    },
  ];



  useEffect(() => {
    fetch(serverURL)
      .then((data) => data.json())
      .then((data) => setTableData(data))
  }, []
  )
  // const dataFromServer = data;// 서버에서 받은 데이터
  // const transformedData = { ...dataFromServer };// JavaScript 객체로 변환
  // <tableData data={transformedData} />// 변환된 데이터를 React 컴포넌트에 전달
  console.log(tableData)



  return (
    <div className="trashcanPage">
      <div className="trashcan">
        <h2>공공 쓰레기통 위치 관리 페이지</h2>
      </div>
      <Link to="/trashcan/newTrashcan">
        <button type="add">추가하기</button>
      </Link>
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

export default Trashcan;