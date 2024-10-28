const db = require('./db');
const AiClassification = require('/home/t23201/svr/v1.0/src/model/AiClassification_prob.js');
const multer = require('multer');
const fs = require('fs').promises;
const express = require('express');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const app = express();
app.use(express.json());

module.exports = {
  aiControl: async function (req, res) {
    const inputImage = "test4.jpg";
    console.log("userId from server (in ai.js): ");
    console.log("inputImage from server (in ai.js): ", inputImage);

    try {
      // AI detect
      const result = await AiClassification.AiClassification(inputImage);
      console.log('--result: ', result);
      const inputImageBuffer = await fs.readFile(`./model/inputs/${inputImage}`);
      console.log("after inputImageBuffer------");
      const inputImageBlob = inputImageBuffer.toString('base64');
      const resultImagePath = result.savedImagePath; 
      const resultImageBuffer = await fs.readFile(resultImagePath);
      const resultImageBlob = resultImageBuffer.toString('base64');

      db.query(`INSERT INTO classification SET user_num = ?, img_bf = ?, classified = ?`, ['164', inputImageBlob, resultImageBlob], function (error, result) {
        if (error) {
          console.log("Error: during db proccessing (in ai.js)", error);
          res.status(500).json({ error: 'Fail: DB ERROR' });
        } else {
          console.log('Inserted into the database!');
          res.json({ success: true });
        }
      });
    } catch (error) {
      console.error('Error processing image:', error);
      res.status(500).json({ error: 'Failed to process image' });
    }
  }
}
// const db = require('./db');
// const AiClassification = require('/home/t23201/svr/v0.9/src/model/AiClassification.js');
// const verifyToken = require('../lib/verifyToken');
// const multer = require('multer');
// const fs = require('fs').promises;;
// const express = require('express');
// const storage = multer.memoryStorage();
// const upload = multer({ storage: storage });

// const app = express();
// app.use(express.json());

// module.exports = {
//   // !! POST ??  (이미지 파일 받아옴.) !!
//   aiControl: async function (req, res) {

//     const inputImage = "/home/t23201/svr/v0.9/src/model/inputs/fromChrome.jpg"
//     console.log("userId from server (in ai.js): ");
//     console.log("inputImage from server (in ai.js): ", inputImage);
//     try{
 
//       const result = await AiClassification(inputImage);
//       console.log(result);

//       //DB에 이미지를 저장하기 위해 이미지파일을 blob 형태로 변환
//       const inputImageBuffer = inputImage.buffer;
//       const inputImageBlob = inputImageBuffer.toString('base64');
//       const resultimagePath = 'path/to/your/uploaded/image.jpg';  // 결과 이미지 위치 설정..
//       const resultimageBuffer = await fs.readFile(imagePath);
//       const resultimageBlob = resultimageBuffer.toString('base64');
      
//       db.query(`INSERT INTO classification SET user_num = ?, img_bf = ?, classified = ?`, ['117', inputImageBlob, resultimageBlob], function (error, result) {
//         if (error) {
//           console.log("Error: during db proccessing (in ai.js)");
//           res.json(500).status("Fail: DB ERROR");
//         }else {
//           // 결과 이미지 전송
//           console.log('저장 됨!')
//           res.json({ success: true });
//         }
//       });
//     } catch (error) {
//         console.error('Error processing image:', error);
//         res.status(500).json({ error: 'Failed to process image' });
//     }
//   }
// }