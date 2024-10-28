import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from 'react-router-dom';
import { useParams } from "react-router-dom";

function ManualUpdate() {
  const [manualData, setManualData] = useState({}); // 빈 객체로 초기화
  const navigate = useNavigate();
  const { manual_num } = useParams(); // URL로부터 manual_num을 가져옴

  useEffect(() => {
    // 데이터를 가져오는 함수
    const fetchManualData = async () => {
      try {
        const response = await fetch(`http://ceprj.gachon.ac.kr:60001/manual/${manual_num}/editing`);
        if (!response.ok) {
          throw new Error('네트워크 응답이 올바르지 않습니다.');
        }
        const data = await response.json();
        setManualData(data); // 받아온 데이터로 상태를 설정
      } catch (error) {
        console.error('데이터를 가져오는 중 오류 발생:', error);
      }
    };

    fetchManualData();
  }, [manual_num]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setManualData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleUpdate = async () => {
    try {
      const response = await fetch(`http://ceprj.gachon.ac.kr:60001/manual/${manual_num}/editing`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(manualData)
      });

      if (response.ok) {
        navigate(`/manual/${manual_num}`); // 수정이 완료되면 해당 매뉴얼 상세페이지로 리디렉트
      } else {
        throw new Error('Update failed');
      }
    } catch (error) {
      console.error('Failed to update manual:', error);
    }
  };

  return (
    <div>
      <h3>매뉴얼 수정 페이지</h3>
      <div className="post-view-row">
        <label>번호</label>
        <label>{manualData.id}</label>
      </div>
      <form>
        <div>
          <label>대분류:</label>
          <input
            type="text"
            name="types"
            value={manualData.types || ''}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label>소분류:</label>
          <input
            type="text"
            name="title"
            value={manualData.title || ''}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label>내용:</label>
          <textarea
            name="content"
            value={manualData.content || ''}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <button type="button" onClick={handleUpdate}>Update</button>
        </div>
      </form>
    </div >
  );
}

export default ManualUpdate;
