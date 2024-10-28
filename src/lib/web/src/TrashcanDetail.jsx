import React from "react";
import { useState } from "react";
import { useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Link } from 'react-router-dom';

// function QnADetail({ match }) {
function QnADetail() {
    // const serverURL = "http://ceprj.gachon.ac.kr:60001/trashcan/${trashcaan_num}";
    const [tableData, setTableData] = useState([]);
    const { town_num } = useParams();
    // const { trashcan_num } = match.params;
    const navigate = useNavigate();
    //const { qna_num } = 1 //match.qna_num;

    useEffect(() => {
        //console.log("\nURL::::", `http://ceprj.gachon.ac.kr:60001/trashcan/${trashcan_num}`)
        fetch(`http://ceprj.gachon.ac.kr:60001/trashcan/${town_num}`, {
            headers: {
                'Content-Type': 'application/json',
                'Who': 'Admin'
            }
        })
            .then((data) => data.json())
            .then((data) => {
                const sortedData = data.sort((a, b) => b.town_num - a.town_num);
                setTableData(sortedData);
                // setTableData(data);
                console.log(tableData);
            })
            .catch(error => console.error('Error fetching data:', error));
    }, [town_num]
    )
    console.log(tableData);

    const columns = [
        { field: "town", headerName: "자치구명", width: 150 },
        { field: "street", headerName: "도로명", width: 170 },
        { field: "detail", headerName: "상세주소", width: 300 },
        { field: "placed", headerName: "위치", width: 200 },
        { field: "types", headerName: "종류", width: 200 },
    ];

    return (
        <div>
            <h2>공공쓰레기통 위치 관리 상세 페이지</h2>
            <div className="TrashcandetailContainer">
                <Link to="/trashcan/newTrashcan">
                    <button type="add">추가하기</button>
                </Link>
                <Link to={`/trashcan/${town_num}/edit`}>
                    <button type="button">수정하기</button>
                </Link>
                <button className="deletebutton"
                    onClick={(e) => {
                        fetch(`http://ceprj.gachon.ac.kr:60001/trashcan/${town_num}/edit`, {
                            method: "DELETE",
                        })
                            .then((response) => {
                                if (!response.ok) {
                                    throw new Error("Error");
                                }
                                navigate("/trashcan");
                            })
                            .catch((e) => {
                                console.log(e);
                            });
                    }}
                >
                    삭제하기
                </button>
                <DataGrid
                    rows={tableData}
                    disableSelectionOnClick
                    columns={columns}
                    pageSize={10}
                    rowsPerPageOptions={[5]}
                />
                <button className="post-view-go-list-btn" onClick={() => navigate('/trashcan')}>목록으로 돌아가기</button>
            </div>
        </div>
    )
}

export default QnADetail;