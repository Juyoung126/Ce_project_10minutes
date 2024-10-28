import React from "react";
import { DataGrid } from "@mui/x-data-grid";
//import { DeleteOutline } from "@mui/icons-material";
import { Link } from 'react-router-dom';
import { useState } from "react";
import { useEffect } from "react";
import "./All.css";
//import { manualList } from "../../../model/adminDB";

function User() {
  const [tableData, setTableData] = useState([]);

  const serverURL = "http://ceprj.gachon.ac.kr:60001/users";
  // const [data, setData] = useState(tableData);

  // const handleDelete = (id) => {
  //     setData(data.filter((item) => item.id !== id));
  // };

  const columns = [
    { field: "id", headerName: "번호", width: 70 },
    { field: "name", headerName: "이름", width: 150 },
    { field: "nickname", headerName: "닉네임", width: 150 },
    { field: "userId", headerName: "아이디", width: 200 },
    { field: "email", headerNmae: "이메일", width: 300 },
    {
      field: "action",
      headerName: "상세보기",
      width: 150,
      renderCell: (params) => {
        return (
          <>
            <Link to={`/users/${params.row.id}`} className="userListEdit">
              <button className="userListEdit">상세보기</button>
            </Link>
            {/* <a href={`/users/${params.row.id}`} className="userListEdit">
              <button className="userListEdit">상세보기</button>
            </a> */}
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
      .then((data) => {
        const sortedData = data.sort((a, b) => b.id - a.id);
        setTableData(sortedData);
      })
  }, []
  )
  console.log("tableData (in User.jsx): ", tableData);



  return (
    <div className="userlistPage">
      <div className="userlist">
        <h2>회원 리스트</h2>
      </div>
      {/* <Link to="/users/:user_num">
        <button type="detail">상세보기</button>
      </Link> */}
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

export default User;