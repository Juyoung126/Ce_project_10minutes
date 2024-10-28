const db = require('./db');
const AiClassification = require('/home/t23201/svr/v1.0/src/controller/admin/AiClassification_prob.js');
const verifyToken = require('/home/t23201/svr/v1.0/src/controller/user/verifyToken.js');
const multer = require('multer');
const express = require('express');
const { createPool } = require('mysql');
const fs = require('fs').promises;

const storage = multer.memoryStorage();
const upload2 = multer({ storage: storage });

const app = express();
app.use(express.json());

module.exports = {
  aiControl: async function (req, res) {
    var userId = null;
    var userNum = null;
    const inputImage = req.file;
    const tempFilePath = '/home/t23201/svr/v1.0/src/controller/admin/inputs/image.jpg';
    const inputImageBuffer = inputImage.buffer;
    await fs.writeFile(tempFilePath, inputImageBuffer);
    
    verifyToken(req, res, async () => {
      userId = req.user.id;
      try {
        db.query('SELECT user_num FROM user WHERE id = ?', [userId], (error, rows) => {
          if (error) {
            console.error('파일을 읽는 중 오류 발생:', error);
            return;
          }
          userNum = rows[0].user_num;
        });
      } catch (error) {
        console.log("Error: during db processing (in ai.js)", error);
        res.status(500).json({ error: 'Fail: DB ERROR' });
      }
    });

    console.log("userId from server (in ai.js): ", req.user.id);
    console.log("inputImage from server (in ai.js): ", inputImageBuffer);

    try {
      const result = await AiClassification.AiClassification("image.jpg");
      const resultImagePath = result.savedImagePath;
      const resultImageBuffer = await fs.readFile(resultImagePath);
      
      console.log("Result image path:", resultImagePath);

      const resultLabelPath = result.savedLabelsPath;
      const isLabelFileExists = await checkFileExists(resultLabelPath);
      if (!isLabelFileExists) {
        console.log('분류에 실패했습니다.');
        
        // 분류 실패 시 DB 처리 로직
        db.query('INSERT INTO classification (user_num, img_bf, classified) VALUES (?, ?, ?)', [userNum, inputImageBuffer, resultImageBuffer], function (error, result) {
          if (error) {
            console.log("Error: during db insertion (in ai.js)", error);
            res.status(500).json({ error: 'Fail: DB INSERT ERROR' });
          } else {
            console.log('Data inserted into DB successfully1');
          }
        });
        db.query('SELECT class_num FROM classification WHERE classified = ? ORDER BY class_num DESC LIMIT 1', [resultImageBuffer], function (error, results) {
          if (error) {
            console.log("Error: during db selection (in ai.js)", error);
            res.status(500).json({ error: 'Fail: DB SELECT ERROR' });
          } else {
            const classNum = results[0].class_num;
            const resultImageBase64 = resultImageBuffer.toString('base64');
            res.json(classNum);
          }
        });

      } else {
        console.log("Result label path:", resultLabelPath);

        let data;
        try {
          data = await fs.readFile(resultLabelPath, 'utf8');
          console.log('파일을 읽는 데 성공했습니다:', data);
        } catch (error) {
          console.error('파일을 읽는 중 오류 발생:', error);
          return res.status(500).json({ error: '파일을 읽는 중 오류 발생' });
        }
        
        // 받아온 텍스트를 줄 단위로 쪼개기
        const lines = data.split('\n').filter(line => line.trim() !== ''); // 빈 줄 제외

        // 각 라벨(숫자)의 개수를 세기 위한 객체 생성
        const labelCounts = {};

        // 각 라벨(숫자)별 초기값 0으로 설정
        for (let i = 0; i <= 15; i++) {
          labelCounts[i] = 0;
        }

        // 각 줄의 첫 번째 숫자가 0에서 15 사이의 값인지 확인하고, 라벨별 개수 세기
        lines.forEach(line => {
          const words = line.split(' ');
          const label = parseInt(words[0]); // 첫 번째 숫자를 라벨로 가정
      
          if (!isNaN(label) && label >= 0 && label <= 15) {
            if (!labelCounts[label]) {
              labelCounts[label] = 1; // 라벨이 없으면 초기화 후 1로 설정
            } else {
              labelCounts[label]++; // 이미 라벨이 있으면 카운트 증가
            }
          }
        });
        console.log(lines.length);
        const lineCount = lines.length;
        console.log('각 라벨(숫자)별 데이터 개수:');
        for (const label in labelCounts) {
          console.log(`라벨 ${label}: ${labelCounts[label]}개`);
        }
        const labelValues = [
          userNum, inputImageBuffer, resultImageBuffer, lineCount,
          labelCounts[0], labelCounts[1], labelCounts[2], labelCounts[3], labelCounts[4],
          labelCounts[5], labelCounts[6], labelCounts[7], labelCounts[8], labelCounts[9],
          labelCounts[10], labelCounts[11], labelCounts[12], labelCounts[13], labelCounts[14],
          labelCounts[15]
        ];
        
        const query = `
          INSERT INTO classification (
            user_num, img_bf, classified, types_count,
            Cardboard, Plastic_Etc, Vinyl, Styrofoam, Glass, Beverage_Can, Canned,
            Metal, Paperboard, Booklets, Carton, Paper_Etc, Plastic_Container, Clear_PET,
            Colored_PET, Packaging_Plastic
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        // 파일 읽기 성공 후 DB 처리 로직
        db.query(query, labelValues, function (error, result) {
          if (error) {
            console.log("Error: during db insertion (in ai.js)", error);
            res.status(500).json({ error: 'Fail: DB INSERT ERROR' });
          } else {
            console.log('Data inserted into DB successfully2');
            db.query('SELECT class_num FROM classification WHERE classified = ? ORDER BY class_num DESC LIMIT 1', [resultImageBuffer], function (error, results) {
              if (error) {
                console.log("Error: during db selection (in ai.js)", error);
                res.status(500).json({ error: 'Fail: DB SELECT ERROR' });
              } else {
                const classNum = results[0].class_num;
                res.json(classNum);
              }
            });
          }
        });       
      }
    } catch (error) {
      console.error('Error processing image:', error);
      res.status(500).json({ error: 'Failed to process image' });
    }
    async function checkFileExists(filePath) {
      try {
        await fs.stat(filePath);
        return true; // 파일 존재
      } catch (error) {
        if (error.code === 'ENOENT') {
          return false; // 파일 없음
        }
        throw error; // 다른 에러 발생
      }
    }
  },
  aiResult: function(req, res){
    verifyToken(req, res, () =>{
      const classNum = req.params.class_num;
      console.log('class_num: ', classNum);
      const ResultSql = 'select * from classification where class_num = ?'
      db.query(ResultSql, classNum, function(error, rows){
        if (error) {
          console.log("Error: during db selection (in ai.js)", error);
          res.status(500).json({ error: 'Fail: DB SELECT ERROR' });
        } else {
          const classNum = rows[0].class_num;
          const resultImageBase64 = Buffer.from(rows[0].classified).toString('base64');
                const responseData ={ 
                  classNum: classNum, 
                  resultImage: resultImageBase64 , 
                  types_count: rows[0].types_count, 
                  Cardboard:rows[0].Cardboard, Plastic_Etc:rows[0].Plastic_Etc, Vinyl:rows[0].Vinyl, 
                  Styrofoam:rows[0].Styrofoam, Glass:rows[0].Glass, Beverage_Can:rows[0].Beverage_Can, 
                  Canned:rows[0].Canned, Metal:rows[0].Metal, Paperboard:rows[0].Paperboard, 
                  Booklets:rows[0].Booklets, Carton:rows[0].Carton, Paper_Etc:rows[0].Paper_Etc, 
                  Plastic_Container:rows[0].Plastic_Container, Clear_PET:rows[0].Clear_PET, Colored_PET:rows[0].Colored_PET, 
                  Packaging_Plastic:rows[0].Packaging_Plastic}
          res.json(responseData);
        }
      })
    })
  },
  upload2: upload2
}

// const db = require('./db');
// const AiClassification = require('/home/t23201/svr/v1.0/src/model/AiClassification_prob.js');
// const verifyToken = require('../lib/verifyToken');
// const multer = require('multer');
// const express = require('express');
// const { createPool } = require('mysql');
// const fs = require('fs').promises;

// const storage = multer.memoryStorage();
// const upload2 = multer({ storage: storage });

// const app = express();
// app.use(express.json());

// module.exports = {
//   aiControl: async function (req, res) {
//     var userId = null;
//     var userNum = null;
//     const inputImage = req.file;
//     const tempFilePath = '/home/t23201/svr/v1.0/src/model/inputs/image.jpg';
//     const inputImageBuffer = inputImage.buffer;
//     await fs.writeFile(tempFilePath, inputImageBuffer);
    
//     verifyToken(req, res, async () => {
//       userId = req.user.id;
//       try {
//         db.query('SELECT user_num FROM user WHERE id = ?', [userId], (error, rows) => {
//           if (error) {
//             console.error('파일을 읽는 중 오류 발생:', error);
//             return;
//           }
//           userNum = rows[0].user_num;
//         });
//       } catch (error) {
//         console.log("Error: during db processing (in ai.js)", error);
//         res.status(500).json({ error: 'Fail: DB ERROR' });
//       }
//     });

//     console.log("userId from server (in ai.js): ", req.user.id);
//     console.log("inputImage from server (in ai.js): ", inputImageBuffer);

//     try {
//       const result = await AiClassification.AiClassification("image.jpg");
//       const resultImagePath = result.savedImagePath;
//       const resultImageBuffer = await fs.readFile(resultImagePath);

//       var words = null;
//       var sentences = null;
//       const resultLablePath = result.savedLabelsPath;
//       if(resultLablePath === null){
//         console.log('분류에 실패했습니다.');
//         db.query('INSERT INTO classification (user_num, img_bf, classified) VALUES (?, ?, ?)', [userNum, inputImageBuffer, resultImageBuffer], function (error, result) {
//           if (error) {

            
//             console.log("Error: during db insertion (in ai.js)", error);
//             res.status(500).json({ error: 'Fail: DB INSERT ERROR' });
//           } else {
//             console.log('Data inserted into DB successfully1');
//           }
//         });

//         db.query('SELECT class_num FROM classification WHERE classified = ?', [resultImageBuffer], function (error, results) {
//           if (error) {
//             console.log("Error: during db selection (in ai.js)", error);
//             res.status(500).json({ error: 'Fail: DB SELECT ERROR' });
//           } else {
//             const classNum = results[0].class_num;
//             const resultImageBase64 = resultImageBuffer.toString('base64');
//             res.json({ classNum: classNum, resultImage: resultImageBase64 });
//           }
//         });
//       }else{
//         fs.readFile(resultLablePath, 'utf8', (err, data) => {
//           if (err) {
//             console.error('파일을 읽는 중 오류 발생:', err);
//             return res.status(500).json({ error: '파일을 읽는 중 오류 발생' });
//           }
//           else {
//             sentences = data.split('\n');
//             sentences.forEach((sentence, index) => {
//               console.log(`문장 ${index + 1}:`, sentence);
//               words = sentence.split(' ');
//               console.log('단어들:', words);
//             });
            
//             db.query('INSERT INTO classification (user_num, img_bf, classified) VALUES (?, ?, ?)', [userNum, inputImageBuffer, resultImageBuffer], function (error, result) {
//               if (error) {
//                 console.log("Error: during db insertion (in ai.js)", error);
//                 res.status(500).json({ error: 'Fail: DB INSERT ERROR' });
//               } else {
//                 console.log('Data inserted into DB successfully2');
//               }
//             });
  
//             db.query('SELECT class_num FROM classification WHERE classified = ?', [resultImageBuffer], function (error, results) {
//               if (error) {
//                 console.log("Error: during db selection (in ai.js)", error);
//                 res.status(500).json({ error: 'Fail: DB SELECT ERROR' });
//               } else {
//                 const classNum = results[0].class_num;
//                 const resultImageBase64 = resultImageBuffer.toString('base64');
//                 res.json({ classNum: classNum, resultImage: resultImageBase64 });
//               }
//             });
//           }
//        });
//       }
//      } catch (error) {
//       console.error('Error processing image:', error);
//       res.status(500).json({ error: 'Failed to process image' });
//     }
//   },
//   upload2: upload2
// }

// module.exports = {
//   aiControl: async function (req, res) {
//     // 사용자 정보 초기화
//     var userId = null;
//     var userNum = null;
//     const inputImage = req.file;
//     // 토큰 검증 미들웨어를 통해 사용자 정보를 가져옵니다
//     const tempFilePath = '/home/t23201/svr/v1.0/src/model/inputs/image.jpg';
//     const inputImageBuffer = inputImage.buffer;
//     await fs.writeFile(tempFilePath,inputImageBuffer);
//     verifyToken(req, res, async () => {
//       userId = req.user.id;
//       try {
//         // 사용자 번호 조회
//         db.query('SELECT user_num FROM user WHERE id = ?', [userId], (error, rows) => {
//           if (error) {
//             console.error('파일을 읽는 중 오류 발생:', error);
//             return;
//           }
//           userNum = rows[0].user_num;
//         });
//       } catch (error) {
//         console.log("Error: during db processing (in ai.js)", error);
//         res.status(500).json({ error: 'Fail: DB ERROR' });
//       }
//     });

//     // 클라이언트에서 전송한 이미지 데이터
//     console.log("userId from server (in ai.js): ", req.user.id);
//     console.log("inputImage from server (in ai.js): ", inputImageBuffer);

//     try {
//       // AI detect
//       const result = await AiClassification.AiClassification("image.jpg");
//       console.log('--result:', result);
//       console.log('--result.savedImagePath: ', result.savedImagePath);
//       console.log('--result.savedLabelsPath: ', result.savedLabelsPath);

//       // 이미지 파일을 읽어와 바이너리 형태로 클라이언트로 전송
//       const resultImagePath = result.savedImagePath;
//       const resultImageBuffer = await fs.readFile(resultImagePath);

//       // 텍스트 파일 읽어와 분할
//       var words = null;
//       var sentences = null;
//       const resultLablePath = result.savedLabelsPath;

//       console.log("+++++++++++++++++++++++before readfile+++++++++++++++++++++++")
//       fs.readFile(resultLablePath, 'utf8', (err, data) => {
//         console.log("+++++++++++++++++++++++after readfile+++++++++++++++++++++++")
//         if (err) {
//           console.error('파일을 읽는 중 오류 발생:', err);
//           return res.status(500).json({ error: '파일을 읽는 중 오류 발생' });
//         }
//         if (!data) {
//           console.log('분류에 실패했습니다.');
//           // DB에 결과 저장
          
//           db.query('INSERT INTO classification (user_num, img_bf, classified) VALUES (?, ?, ?)', [userNum, inputImageBuffer, resultImageBuffer], function (error, result) {
//             if (error) {
//               console.log("Error: during db insertion (in ai.js)", error);
//               res.status(500).json({ error: 'Fail: DB INSERT ERROR' });
//             } else {
//               console.log('Data inserted into DB successfully1');
//             }
//           });

//           // DB에서 class_num 조회
//           db.query('SELECT class_num FROM classification WHERE classified = ?', [resultImageBlob], function (error, results) {
//             if (error) {
//               console.log("Error: during db selection (in ai.js)", error);
//               res.status(500).json({ error: 'Fail: DB SELECT ERROR' });
//             } else {
//               const classNum = results[0].class_num;
//               // 클라이언트로 이미지 바이너리 데이터와 class_num 함께 전송
//               const resultImageBase64 = resultImageBuffer.toString('base64');
//               res.json({ classNum: classNum, resultImage: resultImageBase64 });
//             }
//           });
//         } else {
//           // 줄 바꿈을 기준으로 문장을 분할
//           sentences = data.split('\n');
//           // 각 문장을 순회하면서 원하는 처리 수행
//           sentences.forEach((sentence, index) => {
//             // 각 문장에 대한 처리 (예: 공백을 기준으로 단어로 분할 등)
//             console.log(`문장 ${index + 1}:`, sentence);
//             words = sentence.split(' '); // 각 문장을 공백을 기준으로 단어로 분할
//             console.log('단어들:', words);
//           });
          
//           db.query('INSERT INTO classification (user_num, img_bf, classified) VALUES (?, ?, ?)', [userNum, inputImageBuffer, resultImageBuffer], function (error, result) {
//             if (error) {
//               console.log("Error: during db insertion (in ai.js)", error);
//               res.status(500).json({ error: 'Fail: DB INSERT ERROR' });
//             } else {
//               console.log('Data inserted into DB successfully2');
//             }
//           });

//           // DB에서 class_num 조회
//           db.query('SELECT class_num FROM classification WHERE classified = ?', [resultImageBlob], function (error, results) {
//             if (error) {
//               console.log("Error: during db selection (in ai.js)", error);
//               res.status(500).json({ error: 'Fail: DB SELECT ERROR' });
//             } else {
//               const classNum = results[0].class_num;
//               // 클라이언트로 이미지 바이너리 데이터와 class_num 함께 전송
//               const resultImageBase64 = resultImageBuffer.toString('base64');
//               res.json({ classNum: classNum, resultImage: resultImageBase64 });
//             }
//           });
//         }
//       });


//       // DB에 결과 저장
//       const inputImageBlob = Buffer.from(inputImageBuffer, 'binary');
//       const resultImageBlob = Buffer.from(resultImageBuffer, 'binary'); // 이미지를 Blob으로 변환

//       db.query('INSERT INTO classification (user_num, img_bf, classified) VALUES (?, ?, ?)', [userNum, inputImageBlob, resultImageBlob], function (error, result) {
//         if (error) {
//           console.log("Error: during db insertion (in ai.js)", error);
//           res.status(500).json({ error: 'Fail: DB INSERT ERROR' });
//         } else {
//           console.log('Data inserted into DB successfully');
//         }
//       });

//       // DB에서 class_num 조회
//       db.query('SELECT class_num FROM classification WHERE classified = ?', [resultImageBlob], function (error, results) {
//         if (error) {
//           console.log("Error: during db selection (in ai.js)", error);
//           res.status(500).json({ error: 'Fail: DB SELECT ERROR' });
//         } else {
//           const classNum = results[0].class_num;
//           // 클라이언트로 이미지 바이너리 데이터와 class_num 함께 전송
//           const resultImageBase64 = resultImageBuffer.toString('base64');
//           res.json({ classNum: classNum, resultImage: resultImageBase64 });
//         }
//       });
//     } catch (error) {
//       console.error('Error processing image:', error);
//       res.status(500).json({ error: 'Failed to process image' });
//     }
//   },
//   upload2: upload2 // multer 인스턴스 내보내기
// }


// module.exports = {
//   // !! POST ??  (이미지 파일 받아옴.) !!
//   aiControl: async function (req, res) {
//     console.log("This is an Ai Control   (in ai.js)");
//     var userId = null;
//     var userNum = null;
//     // !! 토큰 검증 미들웨어를 통해 사용자 정보를 가져옵니다 !!
//     verifyToken(req, res, upload.single('inputImage'), async () => {
//       userId = req.user.id;
//     });
//     db.query(`select user_num from user where id = ? `, [userId],(error, rows)=>{
//       if (error) {
//         console.log("Error: during db proccessing (in ai.js)", error);
//         res.status(500).json({ error: 'Fail: DB ERROR' });
//       }
//       userNum = rows[0].user_num;
//     })
//     // !! 사용자 정보 저장을 위한 토큰 정보 !!
//     // const userId = req.user.id;
//     const inputImage = req.body.file;
//     console.log("userId from server (in ai.js): ", req.user.id);
//     console.log("inputImage from server (in ai.js): ", inputImage);
//     try {
//       // !! AI detect !!
//       // !! AI로부터 받은 결과 변수에 저장 (이미지 & 텍스트) !!
//       // const result = await AiClassification('path/to/image.jpg');
//       const result = await AiClassification.AiClassification(inputImage);
//       console.log('--result:', result);
//       console.log('--result.savedImagePath: ', result.savedImagePath);

//       // !! input, output 이미지 db에 저장 !! 
//       // !! output 결과 서버에 전달 (이미지 & 텍스트) !!

//       //DB에 이미지를 저장하기 위해 이미지파일을 blob 형태로 변환
//       // const inputImageBuffer = inputImage.buffer;
//       const inputImageBuffer = await fs.readFile(`./model/inputs/${inputImage}`);
//       console.log("after inputImageBuffer------");
//       const inputImageBlob = inputImageBuffer.toString('base64');
//       const resultImagePath = result.savedImagePath;
//       const resultImageBuffer = await fs.readFile(resultImagePath);
//       const resultImageBlob = resultImageBuffer.toString('base64');
//       // !! DB에 정보를 저장할 때, 결과로 나온 쓰레기들만 개수를 카운트해서 추가. !! 
//       // !! 결과가 숫자면, dictionary를 사용해서 1~21까지 각각에 대해 DB 명을 지정 (...?) !!
//       // !! loop 돌리면서 결과에 있는 숫자들의 개수만큼 +1   (...?)   (아마 배열에 담아서?) !!
//       // !! 저장된 배열 전체를 다시 일대일 mapping(?)해서 db에 저장..?

//       // db.query(`INSERT INTO classification (user_num, date, img_bf, classified, types_count, Cardboard, Paperboard, Booklets, Carton, Paper_Etc, Plastic_Container, Clear_PET, Colored_PET, Packaging_Plastic, Plastic_Etc, Vinyl, ) VALUES (?, ?, ?, ?, ?)`,

//       db.query(`INSERT INTO classification SET user_num = ?, img_bf = ?, classified = ?`, [userNum, inputImageBlob, resultImageBlob], function (error, result) {
//         if (error) {
//           console.log("Error: during db proccessing (in ai.js)", error);
//           res.status(500).json({ error: 'Fail: DB ERROR' });
//         } else {
//           console.log('Inserted into the database!');
//           db.query(`SELECT class_num from classification WHERE classified = ?`, [resultImageBlob], function(error, result){
//             if (error) {
//               console.log("Error: during db proccessing (in ai.js)", error);
//               res.status(500).json({ error: 'Fail: DB ERROR' });
//             }else{
//               const classNum = result[0].class_num;
//               res.json(classNum);
//             }
//           })
//         }
//       });
//     } catch (error) {
//       console.error('Error processing image:', error);
//       res.status(500).json({ error: 'Failed to process image' });
//     }
//   }
// }