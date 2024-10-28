import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Link } from 'react-router-dom';

// 날짜 형식 변경
function formatDate(dateString) {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');

  return `${year}-${month}-${day}`; // 시간 부분을 제거
}

function AdminDetail() {
  const [adminData, setadminData] = useState(null);
  const { admin_num } = useParams();
  // const { no } = match.params;
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`http://ceprj.gachon.ac.kr:60001/admins/${admin_num}`)
      .then(response => {
        if (!response.ok) {
          console.log("1st response: ", response);
          throw new Error('네트워크 응답이 올바르지 않습니다');
        }
        return response.json();
      })
      .then(data => {
        // 서버로부터 받아온 정보 저장
        data.birth = formatDate(data.birth);
        setadminData(data)
      })
      .catch(error => {
        console.error('데이터를 가져오는 중 오류 발생:', error);
      });
  }, [admin_num]);// admin_num이 변경될 때 다시 가져오도록 보장

  console.log(adminData);

  const handleDelete = async () => {
    try {
      const response = await fetch(`http://ceprj.gachon.ac.kr:60001/admins/${admin_num}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Who': 'Admin'
        }
      });

      if (response.ok) {
        navigate('/admin'); // 삭제가 완료되면 매뉴얼 목록 페이지로 리디렉트
      } else {
        throw new Error('Deletion failed');
      }
    } catch (error) {
      console.error('Failed to delete admin:', error);
    }
  };

  return (
    <div>
      <h2 align="center">관리자 상세정보</h2>
      <div className="post-view-wrapper">
        {adminData ? (
          <div>
            <div className="post-view-row">
              <label>번호 </label>
              <label>{adminData.id}</label>
            </div>
            <div className="post-view-row">
              <label>이름 </label>
              <label>{adminData.name}</label>
            </div>
            <div className="post-view-row">
              <label>아이디 </label>
              <label>{adminData.adminId}</label>
            </div>
            <div className="post-view-row">
              <label>생년월일 </label>
              <label>{adminData.birth}</label>
            </div>
            <div className="post-view-row">
              <label>이메일 </label>
              <label>{adminData.email}</label>
            </div>
            <div className="post-view-row">
              <label>부서 </label>
              <label>{adminData.department}</label>
            </div>
            <div className="post-view-row">
              <label>재직 여부 </label>
              {adminData.isUsed ? (
                <label>재직중</label>
              ) : (
                <label>퇴사</label>
              )}
            </div>
            <div className="post-view-row">
              <label>권한 </label>
              {adminData.isAuth ? (
                <label>슈퍼 관리자 </label>
              ) : (
                <label>관리자</label>
              )}
            </div>
          </div>
        ) : '해당 관리자를 찾을 수 없습니다.'
        }
        <Link to={`/admins/${admin_num}/editing`}>
          <button>수정하기</button>
        </Link>
        <button onClick={handleDelete}>삭제</button>
        <button className="post-view-go-list-btn" onClick={() => navigate('/admins')}>목록으로 돌아가기</button>
      </div>
    </div>
  )
}

export default AdminDetail;