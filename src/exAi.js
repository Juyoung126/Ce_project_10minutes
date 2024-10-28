const express = require('express');
const mysql = require('mysql');
const fs = require('fs');

const app = express();
const port = 60001;   // port number
app.use(express.json());

// MariaDB 연결 정보 설정
const pool = mysql.createPool({
  host: 'localhost',
  port: 3306,
  user: 'dbid232',
  password: 'dbpass232',
  database: 'db23201'
});
const version = 'trash_yolov5m_results11'; //여기 파일 이름 넣기
const epochs = '70';
const batch = '8'

const imagePath1 = `/home/t23201/svr/v1.0/AI/yolov5/runs/train/${version}/labels.jpg`; // lable
const imagePath2 = `/home/t23201/svr/v1.0/AI/yolov5/runs/train/${version}/results.png`; // result
const imagePath3 = `/home/t23201/svr/v1.0/AI/yolov5/runs/train/${version}/confusion_matrix.png`; // confusion
let blob1, blob2, blob3;

fs.readFile(imagePath1, (err, data) => {
  if (err) {
    console.error('Error reading image file label:', err);
    return;
  }

  blob1 = data;
});

fs.readFile(imagePath2, (err, data) => {
  if (err) {
    console.error('Error reading image file result:', err);
    return;
  }

  blob2 = data;
});

fs.readFile(imagePath3, (err, data) => {
  if (err) {
    console.error('Error reading image file confusion:', err);
    return;
  }

  blob3 = data;

  // 이미지 파일을 버퍼로 읽어온 후에 데이터베이스에 삽입
  pool.query(
    `INSERT INTO yolo (version, size, batch, epochs, labels, result, confusion, admin_num) values (?, ?, ?, ?, ?, ?, ?, ?) `,
    [version, 'm', batch, epochs, blob1, blob2, blob3, '6'], // 순서대로 배치, 에포크 수 추가
    (error, rows) => {
      if (error) {
        console.log('Error:', error);
      } else {
        console.log('Success:', rows);
      }
    }
  );
});



app.listen(port, () => {
  console.log("Start Listening ------")
});