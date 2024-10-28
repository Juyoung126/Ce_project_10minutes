import React from "react";
import { useState } from "react";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Link } from 'react-router-dom';

function QnADetail({ match }) {
    // const serverURL = "http://ceprj.gachon.ac.kr:60001/trashcan/${trashcaan_num}";
    const [tableData, setTableData] = useState([]);
    // const { trashcan_num } = useParams();
    const { trashcan_num } = match.params;
    const navigate = useNavigate();
    //const { qna_num } = 1 //match.qna_num;

    useEffect(() => {
        //console.log("\nURL::::", `http://ceprj.gachon.ac.kr:60001/trashcan/${trashcan_num}`)
        fetch(`http://ceprj.gachon.ac.kr:60001/trashcan/${trashcan_num}/edit`, {
            headers: {
                'Content-Type': 'application/json',
                'Who': 'Admin'
            }
        })
            .then((data) => data.json())
            .then((data) => {
                setTableData(data);
                console.log(tableData);
            })
            .catch(error => console.error('Error fetching data:', error));
    }, [trashcan_num]
    )
    console.log(tableData);

    return (
        <div>
            <h2 align="center">공공쓰레기통 위치 관리 개별 페이지</h2>
            <div className="TrashcandetailContainer">
                <Link to={`/trashcan/${trashcan_num}/edit`}>
                    <button type="button">수정하기</button>
                </Link>
                <button className="deletebutton"
                    onClick={(e) => {
                        fetch(`http://ceprj.gachon.ac.kr:60001/trashcan/${trashcan_num}/edit`, {
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
                {tableData.id && (
                    <div className="post-view-wrapper">
                        <div className="post-view-row">
                            <label>번호</label>
                            <label>{tableData.id}</label>
                        </div>
                        <div className="post-view-row">
                            <label>자치구명</label>
                            <label>{tableData.town}</label>
                        </div>
                        <div className="post-view-row">
                            <label>도로명</label>
                            <label>{tableData.street}</label>
                        </div>
                        <div className="post-view-row">
                            <label>상세주소</label>
                            <label>{tableData.detail}</label>
                        </div>
                        <div className="post-view-row">
                            <label>설치 위치</label>
                            <label>{tableData.placed}</label>
                        </div>
                        <div className="post-view-row">
                            <label>쓰레기통 종류</label>
                            <label>{tableData.types}</label>
                        </div>
                    </div>
                )}
                <button className="post-view-go-list-btn" onClick={() => navigate('/trashcan')}>목록으로 돌아가기</button>
            </div>
        </div>
    )
}

export default QnADetail;