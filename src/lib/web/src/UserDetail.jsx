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

function UserDetail() {
  //UserDetail({match})

  // const [userData, setUserData] = useState({});
  const [userData, setUserData] = useState(null);
  const { user_num } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`http://ceprj.gachon.ac.kr:60001/users/${user_num}`)
      .then(response => {
        if (!response.ok) {
          console.log("1st response: ", response);
          throw new Error('네트워크 응답이 올바르지 않습니다');
        }
        console.log("response (in fetch process): ", response);
        return response.json();
      })
      .then(data => {
        // 서버로부터 받아온 정보 저장
        data.birth = formatDate(data.birth);
        setUserData(data);
      })
      .catch(error => {
        console.error('데이터를 가져오는 중 오류 발생:', error);
      });
  }, [user_num]);// userNum이 변경될 때 다시 가져오도록 보장

  console.log(userData);

  const handleDelete = async () => {
    try {
      const response = await fetch(`http://ceprj.gachon.ac.kr:60001/users/${user_num}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Who': 'Admin'
        }
      });

      if (response.ok) {
        navigate('/users'); // 삭제가 완료되면 사용자 목록 페이지로 리디렉트
      } else {
        throw new Error('Deletion failed');
      }
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  return (
    <div>
      <h2 align="center">회원 상세정보</h2>
      <div className="post-view-wrapper">
        {userData ? (
          <div>
            <div className="post-view-row">
              <label>번호</label>
              <label>{userData.id}</label>
            </div>
            <div className="post-view-row">
              <label>이름</label>
              <label>{userData.name}</label>
            </div>
            <div className="post-view-row">
              <label>닉네임</label>
              <label>{userData.nickname}</label>
            </div>
            <div className="post-view-row">
              <label>아이디</label>
              <label>{userData.userId}</label>
            </div>
            <div className="post-view-row">
              <label>생년월일</label>
              <label>{userData.birth}</label>
            </div>
            <div className="post-view-row">
              <label>이메일</label>
              <label>{userData.email}</label>
            </div>
            <div className="post-view-row">
              <label>분리배출 히스토리</label>
              <Link to={`/users/${user_num}/trashHis`}>
                <button>바로가기</button>
              </Link>
            </div>
          </div>
        ) : (
          <h6>해당 회원을 찾을 수 없습니다.</h6>
        )}
        <button onClick={handleDelete}>삭제</button> {/* 삭제 버튼 추가 */}
        <button className="post-view-go-list-btn" onClick={() => navigate('/users')}>목록으로 돌아가기</button>
      </div>
    </div >
  )
}

export default UserDetail;



