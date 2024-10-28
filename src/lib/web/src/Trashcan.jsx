import React from "react";
import { DataGrid } from "@mui/x-data-grid";
import { DeleteOutline } from "@mui/icons-material";
import { Link } from 'react-router-dom';
import { useState } from "react";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import "./All.css";
//import { manualList } from "../../../model/adminDB";

function Trashcan() {
  const [tableData, setTableData] = useState([]);
  // const { town_num } = useParams();

  const serverURL = "http://ceprj.gachon.ac.kr:60001/trashcan";
  // const [data, setData] = useState(tableData);

  // const handleDelete = (id) => {
  //     setData(data.filter((item) => item.id !== id));
  // };

  const columns = [
    { field: "town_num", headerName: "번호", width: 150 },
    { field: "town", headerName: "자치구명", width: 150 },
    { field: "countGeneral", headerName: "일반 쓰레기통", width: 200 },
    { field: "countRecycle", headerName: "재활용 쓰레기통", width: 200 },
    { field: "countTown", headerName: "전체 개수", width: 150 },
    {
      field: "action",
      headerName: "상세보기",
      width: 150,
      renderCell: (params) => {
        var town_num = params.row.town_num;
        return (
          <>
            <Link to={`/trashcan/${town_num}`} className="trashcanEdit">
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
    fetch(serverURL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Who': 'Admin'
      }
    })
      .then((data) => data.json())
      .then((data) => setTableData(data))
  }, []
  )
  // const dataFromServer = data;// 서버에서 받은 데이터
  // const transformedData = { ...dataFromServer };// JavaScript 객체로 변환
  // <tableData data={transformedData} />// 변환된 데이터를 React 컴포넌트에 전달
  console.log(tableData)

  const rows = [];
  //table 분류 및 개수 계산
  var categorizedData = new Map();

  tableData.forEach(function (item) {
    var key = item.town + '/' + item.types;

    if (!categorizedData.has(key)) {
      categorizedData.set(key, { town: item.town, type: item.types, count: 0 });
    }

    categorizedData.get(key).count += 1;
  });

  //데이터 추가
  categorizedData.forEach(function (value) {
    rows.push({ id: rows.length + 1, ...value });
  });

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
    </div >
  );
}

export default Trashcan;