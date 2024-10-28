import React from "react";
import { useState, useEffect } from "react";
import "./AI.css";

import img_result from './trash_yolov5m_results3/results.png';
import img_confusion_matrix from './trash_yolov5m_results3/confusion_matrix.png';
import img_F1_curve from './trash_yolov5m_results3/F1_curve.png';

function AI2() {
  // const [classificationArray, setClassificationArray] = useState([]);
  const [currentVersion, setCurrentVersion] = useState('trash_yolov5m_results3');
  const [lastUpdateDate, setLastUpdateDate] = useState('2023-11-13');

  // setCurrentVersion('trash_yolov5m_results3');
  // // const startNow = new Date();
  // setLastUpdateDate('2023.11.13');

  const [sums, setSums] = useState({
    class_num: 0,
    types_count: 0,
    Cardboard: 0,
    Plastic_Etc: 0,
    Vinyl: 0,
    Styrofoam: 0,
    Glass: 0,
    Beverage_Can: 0,
    Canned: 0,
    Metal: 0,
    Paperboard: 0,
    Paper_Cup: 0,
    Newspaper: 0,
    Booklets: 0,
    Carton: 0,
    Paper_Etc: 0,
    Plastic_Container: 0,
    ClearPET: 0,
    ColoredPET: 0,
    Packaging_Plastic: 0
  });


  useEffect(() => {
    fetch(`http://ceprj.gachon.ac.kr:60001/aiManage`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Who': 'Admin'
      }
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('네트워크 응답이 올바르지 않습니다');
        }
        return response.json();
      })
      .then(data => {
        setSums(data);


      })
      .catch(error => {
        console.error('데이터를 가져오는 중 오류 발생:', error);
      });
  }, []);

  // const columns = [
  //   { name: "class_num", displayName: "Class Number" },
  //   { name: "types_count", displayName: "Types Count" },
  //   { name: "Cardboard", displayName: "Cardboard" },
  //   { name: "Plastic_Etc", displayName: "Plastic Etc" },
  //   { name: "Vinyl", displayName: "Vinyl" },
  //   { name: "Styrofoam", displayName: "Styrofoam" },
  //   { name: "Glass", displayName: "Glass" },
  //   { name: "Beverage_Can", displayName: "Beverage Can" },
  //   { name: "Canned", displayName: "Canned" },
  //   { name: "Metal", displayName: "Metal" },
  //   { name: "Paperboard", displayName: "Paperboard" },
  //   { name: "Paper_Cup", displayName: "Paper Cup" },
  //   { name: "Newspaper", displayName: "Newspaper" },
  //   { name: "Booklets", displayName: "Booklets" },
  //   { name: "Carton", displayName: "Carton" },
  //   { name: "Paper_Etc", displayName: "Paper Etc" },
  //   { name: "Plastic_Container", displayName: "Plastic Container" },
  //   { name: "ClearPET", displayName: "ClearPET" },
  //   { name: "ColoredPET", displayName: "ColoredPET" },
  //   { name: "Packaging_Plastic", displayName: "Packaging Plastic" }
  // ];
  const rows = Object.entries(sums);

  const updateHandler = () => {
    console.log("You press update button!");
    // const now = new Date();
    // setLastUpdateDate(now.toLocaleString());
  }

  return (
    <div>
      <h4 style="font-weight: bold;">AI 버전 관리</h4>
      <br />
      <h5>현재 버전: {currentVersion}</h5>

      <div>
        <h5 style={{ display: 'inline-block', marginRight: '10px' }}>최신 업데이트 날짜: {lastUpdateDate}</h5>
        <button onClick={updateHandler}>업데이트 하기</button>
      </div>
      <br />
      <div><h5>성능 지표</h5></div>
      <table>
        <tbody>
          <tr>
            <td className="table_title">
              <h6>{currentVersion} - result</h6>
            </td>
            <td className="table_title">
              <h6>{currentVersion} - confusion_matrix</h6>
            </td>
          </tr>
          <tr >
            <td>
              <img src={img_result} alt="result" className="AI_images" />
            </td>
            <td>
              <img src={img_confusion_matrix} alt="confusion_matrix" className="AI_images" />
            </td>
          </tr>
          <tr>
            <td className="table_title">
              <h6 className="table_title">{currentVersion} - F1_curve</h6>
            </td>
            <td></td>
          </tr>
          <tr>
            <td>
              <img src={img_F1_curve} alt="F1_curve" className="AI_images" />
            </td>
          </tr>
        </tbody>
        {/* <tbody>
          <tr>
            <td>
              <div>
                <h5>{currentVersion} - result</h5>
                <img src={img_result} alt="result" className="AI_images" />
              </div>
            </td>
            <td>
              <div>
                <h5>{currentVersion} - confusion_matrix</h5>
                <img src={img_confusion_matrix} alt="confusion_matrix" className="AI_images" />
              </div>
            </td>
          </tr>
          <div>
            <h5>{currentVersion} - F1_curve</h5>
            <img src={img_F1_curve} alt="F1_curve" className="AI_images" />
          </div>
        </tbody> */}
      </table>
      <br />
      <br />
      <div><h4>전체 분리배출 기록</h4></div>
      <div>
        <table>

          <thead>
            <tr className="table_title">
              <th>name</th>
              <th>contents</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([name, value]) => (
              <tr key={name}>
                <td>{name}</td>
                <td>{value}</td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>
    </div >
  )
}

export default AI2;



// return 속 주석
//   {/* <h3>현재 버전: {currentVersion}</h3>
//       <h4>최신 업데이트 날짜: {lastUpdateDate}</h4> */}

//         {/* <button onClick={updateHandler}>업데이트 하기</button> */}


// {/* <thead>
//             <tr><th>name</th></tr>
//             <tr><th>contents</th></tr>
//             {/* <tr>
//               {columns.map(column => (
//                 <th key={column.name}>{column.displayName}</th>
//               ))}
//             </tr> 
//         </thead> */}

// {/* <tbody>
//             <tr>
//               {columns.map(column => (
//                 <td key={column.name}>{column.displayName}</td>
//                 <td key={column.name}>{sums[column.name]}</td>
//               ))}
//             </tr>
//           </tbody> */}