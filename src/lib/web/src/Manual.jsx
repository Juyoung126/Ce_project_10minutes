import React from "react";
import { DataGrid } from "@mui/x-data-grid";
import { DeleteOutline } from "@mui/icons-material";
import { Link } from 'react-router-dom';
import { useState } from "react";
import { useEffect } from "react";
import "./All.css";
//import { manualList } from "../../../model/adminDB";

function Manual() {
    const [tableData, setTableData] = useState([]);

    const serverURL = "http://ceprj.gachon.ac.kr:60001/manual";
    // const [data, setData] = useState(tableData);

    // const handleDelete = (id) => {
    //     setData(data.filter((item) => item.id !== id));
    // };

    const columns = [
        { field: "id", headerName: "번호", width: 70 },
        { field: "types", headerName: "대분류", width: 150 },
        { field: "title", headerName: "소분류", width: 150 },
        // { field: "content", headerName: "내용", width: 400 },
        {
            field: "action",
            headerName: "상세보기",
            width: 150,
            renderCell: (params) => {
                var manual_num = params.row.id;
                return (
                    <>
                        <Link to={`/manual/${manual_num}`} className="manualDetail">
                            <button className="manualListEdit">상세보기</button>
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
        <div className="manualPage">
            <div className="manual">
                <h2>분리배출 매뉴얼 페이지</h2>
            </div>
            <Link to="/manual/newManual">
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

export default Manual;