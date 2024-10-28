import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function NewTrashcan() {
  const [town, setTown] = useState('');
  const [street, setStreet] = useState('');
  const [stAddress, setStAddress] = useState('');
  const [detail, setDetail] = useState('');
  const [placed, setPlaced] = useState('');
  const [types, setTypes] = useState('');
  const navigate = useNavigate();

  const handleNewTrashcan = (e) => {
    e.preventDefault();
    fetch(`http://ceprj.gachon.ac.kr:60001/trashcan/newTrashcan`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        'Who': 'Admin'
      },
      body: JSON.stringify({
        town: town,
        street: street,
        st_address: stAddress,
        detail: detail,
        placed: placed,
        types: types,
      }),
    })
      // .then((response) => console.log(response))
      .then(response => {
        if (response.ok) { //데이터 추가가 성공했을 경우
          navigate('/trashcan');
        }
        else {
          throw new Error('데이터 추가에 실패했습니다.');
        }
      })
  }

  const handleTownChange = (event) => {
    setTown(event.target.value);
  };

  const handleTypesChange = (event) => {
    if (event.target.value === "알 수 없음") {
      setTypes("");
    }
    else {
      setTypes(event.target.value);
    }
  };

  return (
    <div className="NewTrashcanPage">
      <div className="NewTrashcan">
        <h2>쓰레기통 위치 추가하기</h2>
      </div>
      <form onSubmit={handleNewTrashcan} name="newTrashcan">
        <label htmlFor="town-select">자치구명: </label>
        <select
          id="town-select"
          value={town}
          onChange={handleTownChange}
        >
          <option value="종로구">종로구</option>
          <option value="중구">중구</option>
          <option value="용산구">용산구</option>
          <option value="성동구 ">성동구 </option>
          <option value="광진구">광진구</option>
          <option value="동대문구">동대문구</option>
          <option value="중랑구">중랑구</option>
          <option value="성북구">성북구</option>
          <option value="강북구 ">강북구 </option>
          <option value="동작구">동작구</option>
          <option value="노원구">노원구</option>
          <option value="은평구">은평구</option>
          <option value="서대문구">서대문구</option>
          <option value="마포구">마포구</option>
          <option value="양천구">양천구</option>
          <option value="강서구">강서구</option>
          <option value="구로구">구로구</option>
          <option value="금천구">금천구</option>
          <option value="영등포구">영등포구</option>
          <option value="서초구">서초구</option>
          <option value="강남구">강남구</option>
          <option value="송파구">송파구</option>
          <option value="강동구">강동구</option>
          <option value="관악구">관악구</option>
          <option value="도봉구">도봉구</option>
        </select><br />
        {/* <p>자치구명: {town}</p> */}
        <label>
          도로명:
          <input type="text" value={street} onChange={(e) => setStreet(e.target.value)} name="street" />
        </label>
        <label>
          도로명 주소:
          <input type="text" value={stAddress} onChange={(e) => setStAddress(e.target.value)} name="stAddress" />
        </label>
        <label>
          상세 주소:
          <input type="text" value={detail} onChange={(e) => setDetail(e.target.value)} name="detail" />
        </label>
        <label>
          쓰레기통 위치:
          <input type="text" value={placed} onChange={(e) => setPlaced(e.target.value)} name="placed" />
        </label><br />
        {/* <label>
          쓰레기통 종류:
          <input type="text" value={types} onChange={(e) => setTypes(e.target.value)} name="types" />
        </label> */}
        <label htmlFor="types-select">쓰레기통 종류: </label>
        <select
          id="types-select"
          value={types}
          onChange={handleTypesChange}
        >
          <option value="일반쓰레기">일반쓰레기</option>
          <option value="재활용">재활용</option>
          <option value="알 수 없음">알 수 없음</option>
        </select><br />
        <button type="submit">추가하기</button>
      </form>
    </div>
  );
}

export default NewTrashcan;

// ==================yes==========================
// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";

// function NewTrashcan() {
//   const [town, setTown] = useState('');
//   const [street, setStreet] = useState('');
//   const [stAddress, setStAddress] = useState('');
//   const [detail, setDetail] = useState('');
//   const [placed, setPlaced] = useState('');
//   const [types, setTypes] = useState('');
//   const navigate = useNavigate();

//   const handleNewTrashcan = (e) => {
//     e.preventDefault();
//     fetch(`http://ceprj.gachon.ac.kr:60001/trashcan/newTrashcan`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         'Who': 'Admin'
//       },
//       body: JSON.stringify({
//         town: town,
//         street: street,
//         st_address: stAddress,
//         detail: detail,
//         placed: placed,
//         types: types,
//       }),
//     })
//       // .then((response) => console.log(response))
//       .then(response => {
//         if (response.ok) { //데이터 추가가 성공했을 경우
//           navigate('/trashcan');
//         }
//         else {
//           throw new Error('데이터 추가에 실패했습니다.');
//         }
//       })
//   }

//   return (
//     <div className="NewTrashcanPage">
//       <div className="NewTrashcan">
//         <h2>쓰레기통 위치 추가하기</h2>
//       </div>
//       <form onSubmit={handleNewTrashcan} name="newTrashcan">
//         <label>
//           자치구명:
//           <input type="text" value={town} onChange={(e) => setTown(e.target.value)} name="town" />
//         </label>
//         <label>
//           도로명:
//           <input type="text" value={street} onChange={(e) => setStreet(e.target.value)} name="street" />
//         </label>
//         <label>
//           도로명 주소:
//           <input type="text" value={stAddress} onChange={(e) => setStAddress(e.target.value)} name="stAddress" />
//         </label>
//         <label>
//           상세 주소:
//           <input type="text" value={detail} onChange={(e) => setDetail(e.target.value)} name="detail" />
//         </label>
//         <label>
//           쓰레기통 위치:
//           <input type="text" value={placed} onChange={(e) => setPlaced(e.target.value)} name="placed" />
//         </label>
//         <label>
//           쓰레기통 종류:
//           <input type="text" value={types} onChange={(e) => setTypes(e.target.value)} name="types" />
//         </label>
//         <button type="submit">추가하기</button>
//       </form>
//     </div>
//   );
// }

// export default NewTrashcan;

// ====================no============================

// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import "./All.css";

// function NewTrashcan() {
//   const [town, setTown] = useState('');
//   const [street, setStreet] = useState('');
//   const [stAddress, setStAddress] = useState('');
//   const [detail, setDetail] = useState('');
//   const [placed, setPlaced] = useState('');
//   const [types, setTypes] = useState('');
//   const navigate = useNavigate();

//   useEffect(() => {
//     fetch(`http://ceprj.gachon.ac.kr:60001/trashcan/newTrashcan`, {
//       method: "GET",
//       headers: {
//         "Content-Type": "application/json",
//         'Who': 'Admin'
//       },
//     })
//       .then((response) => response.json())
//       .then((data) => console.log(data));
//   }, []);

//   const handleNewTrashcan = (e) => {
//     e.preventDefault();
//     fetch("http://ceprj.gachon.ac.kr:60001/trashcan/newTrashcan", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         'Who': 'Admin'
//       },
//       body: JSON.stringify({
//         town: town,
//         street: street,
//         st_address: stAddress,
//         detail: detail,
//         placed: placed,
//         types: types,
//       }),
//     })
//       // .then((response) => console.log(response))
//       .then((response) => {
//         if (response.status === 200) { //데이터 추가가 성공했을 경우
//           navigate('/trashcan');
//         }
//         else {
//           throw new Error('데이터 추가에 실패했습니다.');
//         }
//       })
//   }

//   return (
//     <div className="NewTrashcanPage">
//       <div className="NewTrashcan">
//         <h2>공공 쓰레기통 위치 추가하기</h2>
//       </div>
//       <form onSubmit={handleNewTrashcan} name="newTrashcan">
//         <label>
//           자치구명:
//           <input type="text" value={town} onChange={(e) => setTown(e.target.value)} name="town" />
//         </label>
//         <br></br>
//         <label>
//           도로명:
//           <input type="text" value={street} onChange={(e) => setStreet(e.target.value)} name="street" />
//         </label>
//         <br></br>
//         <label>
//           도로명 주소:
//           <input type="text" value={stAddress} onChange={(e) => setStAddress(e.target.value)} name="stAddress" />
//         </label>
//         <br></br>
//         <label>
//           상세주소:
//           <input type="text" value={detail} onChange={(e) => setDetail(e.target.value)} name="detail" />
//         </label>
//         <br></br>
//         <label>
//           쓰레기통 위치:
//           <input type="text" value={placed} onChange={(e) => setPlaced(e.target.value)} name="placed" />
//         </label>
//         <br></br>
//         <label>
//           쓰레기통 종류:
//           <input type="text" value={types} onChange={(e) => setTypes(e.target.value)} name="types" />
//         </label>
//         <br></br>
//         <button type="submit">추가하기</button>
//       </form>
//     </div>
//   );
// }

// export default NewTrashcan;