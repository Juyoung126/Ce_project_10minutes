import React from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Link } from 'react-router-dom';
import { useState } from "react";
import { useEffect } from "react";
//import { manualList } from "../../../model/adminDB";

function Admin() {
    const [tableData, setTableData] = useState([]);

    const serverURL = "http://ceprj.gachon.ac.kr:60001/admins";

    const columns = [
        { field: "id", headerName: "번호", width: 70 },
        { field: "name", headerName: "이름", width: 150 },
        { field: "adminId", headerName: "아이디", width: 150 },
        { field: "department", headerName: "부서", width: 200 },
        { field: "isUsed", headerName: "재직 여부", width: 200 },
        { field: "isAuth", headerName: "슈퍼 관리자", width: 200 },
        {
            field: "action",
            headerName: "상세보기",
            width: 150,
            renderCell: (params) => {
                return (
                    <>
                        <Link to={`/admins/${params.row.id}`} className="adminListEdit">
                            <button className="adminListEdit">상세보기</button>
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
            .then((data) => {
                const sortedData = data.sort((a, b) => b.id - a.id);
                setTableData(sortedData);
            })
    }, []
    )
    // const dataFromServer = data;// 서버에서 받은 데이터
    // const transformedData = { ...dataFromServer };// JavaScript 객체로 변환
    // <tableData data={transformedData} />// 변환된 데이터를 React 컴포넌트에 전달
    console.log(tableData)



    return (
        <div className="adminPage">
            <div className="admin">
                <h2>관리자 관리 페이지</h2>
            </div>
            <Link to="/admins/newAdmin">
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

export default Admin;