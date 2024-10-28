import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from 'react-router-dom';
import { useParams } from "react-router-dom";

// import { useMemo } from "react";
// import Table from "./Table";

function ManualDetail() {
  const [manualData, setManualData] = useState({});
  const { manual_num } = useParams();

  // const { no } = match.params;
  const navigate = useNavigate();

  console.log("+++ Before useEffect()");
  useEffect(() => {
    console.log("+++ In useEffect()");
    fetch(`http://ceprj.gachon.ac.kr:60001/manual/${manual_num}`, {
      headers: {
        'Content-Type': 'application/json',
        'Who': 'Admin'
      }
    })
      .then(response => response.json())
      .then((data) => {
        setManualData(data);
        console.log("manualData (in fetch process): ", manualData);
      })
      .catch(error => {
        console.error('데이터를 가져오는 중 오류 발생:', error);
      });
  }, [manual_num]);// manual_num이 변경될 때 다시 가져오도록 보장

  console.log("\n===============\n manualData: ", manualData);
  console.log("manualData.id", manualData.id);

  const handleDelete = async () => {
    try {
      const response = await fetch(`http://ceprj.gachon.ac.kr:60001/manual/${manual_num}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Who': 'Admin'
        }
      });

      if (response.ok) {
        navigate('/manual'); // 삭제가 완료되면 매뉴얼 목록 페이지로 리디렉트
      } else {
        throw new Error('Deletion failed');
      }
    } catch (error) {
      console.error('Failed to delete manual:', error);
    }
  };

  return (
    <>
      <h2 align="center">매뉴얼 상세정보</h2>
      <div className="post-view-wrapper">
        {
          manualData ? (
            <>
              <div className="post-view-row">
                <label>번호</label>
                <label>{manualData.id}</label>
              </div>
              <div className="post-view-row">
                <label>대분류</label>
                <label>{manualData.types}</label>
              </div>
              <div className="post-view-row">
                <label>소분류</label>
                <label>{manualData.title}</label>
              </div>
              <div className="post-view-row">
                <label>내용</label>
                <label>{manualData.content}</label>
              </div>
              <div className="post-view-row">
                <label>포함 항목</label>
                <label>{manualData.eligible_item}</label>
              </div>
              <div className="post-view-row">
                <label>미포함 항목</label>
                <label>{manualData.ineligible_item}</label>
              </div>
            </>
          ) : ('해당 매뉴얼을 찾을 수 없습니다.')
        }

      </div>
      <Link to={`/manual/${manual_num}/editing`}>
        <button>수정하기</button>
      </Link>
      <button onClick={handleDelete}>삭제</button> {/* 삭제 버튼 추가 */}
      <button className="post-view-go-list-btn" onClick={() => navigate('/manual')}>목록으로 돌아가기</button>
    </>
  )
  // const [manual_num, setManual_num] = useState([]);
  // const [types, setTypes] = useState([]);
  // const [title, setTitle] = useState([]);
  // const [content, setContent] = useState([]);

  // const rows = useMemo(
  //     () => [
  //         {
  //             accessor: "manual_num",
  //             header: "manual_num",
  //         },
  //         {
  //             accessor: "types",
  //             header: "types",
  //         },
  //         {
  //             accessor: "title",
  //             header: "title",
  //         },
  //         {
  //             accessor: "content",
  //             header: "content",
  //         },
  //     ],
  //     []
  // );

  // fetch("http://ceprj.gachon.ac.kr:60001/manual/:manual_num", {
  //     method: "GET",
  //     headers: {
  //         "Content-Type": "application/json",
  //         'Who': 'Admin'
  //     },
  //     body: JSON.stringify({ manual_num, types, title, content }),
  // })

  // const data = useMemo(
  //     () =>
  //         Array(60)
  //             .fill()
  //             .map(() => ({
  //                 id: { manual_num },
  //                 types: { types },
  //                 title: { title },
  //                 content: { content },
  //             })),
  //     []
  // );
  // return (
  //     <div>
  //         <h2>매뉴얼 상세 페이지</h2>
  //         <button>수정하기</button>
  //         <button>삭제하기</button>
  //         <Table rows={rows} data={data} />
  //     </div>
  // );
}

export default ManualDetail;