const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const db = require('./db.js');
const bcrypt = require('bcrypt');
const { createSecretKey } = require('crypto');
const e = require('cors');
const saltRounds = 10;  // 해싱에 사용. 보안을 높여주기 위해서? 비교를 위해서...
const getMimeType = require('./getMimeType.js');
const { AiTraining } = require('./AiTraining.js');
const { rsqrt } = require('@tensorflow/tfjs-node');
const fsPromises = require('fs').promises;




app.use(express.json());
// app.use(express.static(path.join(__dirname, '/../view/web/build', 'utf8')));
app.use(bodyParser.urlencoded({ extended: false }));


module.exports = {
  // =======================================================================
  // <------------------------ AI Result & Feedback  ---------------------->
  // =======================================================================
  // GET 'AI result & Feedback Page'  (AI 전체 분류 결과 및 피드백)
  feedbackPage: function (req, res) {
    // ==========================================================
    // ===================== pagenation 적용 ================================
    // ==========================================================
    // console.log('[GET] AI Result & Feedback Page for Admin (in adminAI.js)');

    // // 페이지네이션을 위한 페이지와 페이지 크기를 쿼리 파라미터에서 추출합니다.
    // const page = parseInt(req.query.page) || 1;
    // const pageSize = parseInt(req.query.pageSize) || 20;
    // const offset = (page - 1) * pageSize;

    // // 페이지네이션 적용을 위한 SQL 쿼리 수정
    // const sql = `
    //   SELECT * FROM classification
    //   LIMIT ?
    //   OFFSET ?`;

    // // 데이터베이스 쿼리 실행
    // db.query(sql, [pageSize, offset], function (error, result) {
    //   // 에러 처리
    //   if (error) {
    //     console.log("Error in DB Process :: Cannot SELECT from DB");
    //     return res.status(500).json('Fail: DB ERROR.');
    //   }

    //   // DB에서 데이터가 없는 경우
    //   if (result[0] === undefined) {
    //     console.log("i got no information from classification table");
    //     return res.status(404).json("I got nothing from classification table");
    //   }

    //   // AI 분류 결과 매핑
    //   const feedback = result.map((row) => {
    //     const changeClassified = row.classified ? Buffer.from(row.classified).toString('base64') : null;

    //     // 매핑된 객체 반환
    //     return {
    //       id: row.class_num,
    //       user_num: row.user_num,
    //       date: row.date,
    //       // img_bf: changeImg_bf,
    //       classified: changeClassified,
    //       types_count: row.types_count,
    //       Cardboard: row.Cardboard,
    //       Plastic_Etc: row.Plastic_Etc,
    //       Vinyl: row.Vinyl,
    //       Styrofoam: row.Styrofoam,
    //       Glass: row.Glass,
    //       Beverage_Can: row.Beverage_Can,
    //       Canned: row.Canned,
    //       Metal: row.Metal,
    //       Paperboard: row.Paperboard,
    //       Booklets: row.Booklets,
    //       Carton: row.Carton,
    //       Paper_Etc: row.Paper_Etc,
    //       Plastic_Container: row.Plastic_Container,
    //       Clear_PET: row.Clear_PET,
    //       Colored_PET: row.Colored_PET,
    //       Packaging_Plastic: row.Packaging_Plastic,
    //       feedback: row.feedback,
    //       feed_star: row.feed_star,
    //     };
    //   });

    //   // 로그 출력
    //   console.log("\n>>> console.start ==================\n");
    //   console.log(feedback);
    //   console.log("\n ================================================\n");
    //   console.log(" ============================ console.finish <<<\n");

    //   // 클라이언트에게 데이터 전송
    //   res.send(feedback);
    // });

    // =============================================
    // =============================================
    // =============================================
    console.log('[GET] AI Result & Feedback Page for Admin   (in adminAI.js)');

    //
    db.query(`SELECT * FROM classification`, function (error, result) {
      if (error) {
        console.log("Error in DB Process  ::  Cannot SELECT from DB");
        res.status(500).json('Fail: DB ERROR. ');
      }

      // select NOTHING from DB   (DB에서 꺼내온 정보가 없음.) 
      if (result[0] === undefined) {
        console.log("i got no information from classification table");
        res.status(404).json("I got nothing from classification table");
      }


      //
      // db.query(`SELECT * FROM classification`, function (error, result) {
      //   // error 
      //   if (error) {
      //     console.error('DB 오류:', error);
      //     res.status(500).json('Fail: Login  ::  <Server Error> DB');
      //   }

      //   // Couldn't find data (불러온 데이터가 없음)
      //   if (result.length === 0) {
      //     console.log("There's no information like that");
      //     res.status(404).json("Fail: Login  ::  Couldn't find any data");
      //   }

      // AI 분류 결과 성공적으로 불러옴
      else {
        const feedback = result.map((row) => {

          // 페이지 로딩 시간 많이 소요됨 --> 이전 이미지 제외
          // const changeImg_bf = row.img_bf ? Buffer.from(row.img_bf).toString('base64') : null;
          const changeClassified = row.classified ? Buffer.from(row.classified).toString('base64') : null;

          return {
            id: row.class_num,
            user_num: row.user_num,
            date: row.date,
            // img_bf: changeImg_bf,
            classified: changeClassified,
            types_count: row.types_count,
            Cardboard: row.Cardboard,
            Plastic_Etc: row.Plastic_Etc,
            Vinyl: row.Vinyl,
            Styrofoam: row.Styrofoam,
            Glass: row.Glass,
            Beverage_Can: row.Beverage_Can,
            Canned: row.Canned,
            Metal: row.Metal,
            Paperboard: row.Paperboard,
            Booklets: row.Booklets,
            Carton: row.Carton,
            Paper_Etc: row.Paper_Etc,
            Plastic_Container: row.Plastic_Container,
            Clear_PET: row.Clear_PET,
            Colored_PET: row.Colored_PET,
            Packaging_Plastic: row.Packaging_Plastic,
            feedback: row.feedback,
            feed_star: row.feed_star,
          };
        });
        console.log("\n>>> console.start ==================\n");    // 분류결과 정보 전달
        console.log(feedback);    // 분류결과 정보 전달
        console.log("\n ================================================");    // 분류결과 정보 전달
        console.log(" ============================ console.finish <<<\n");    // 분류결과 정보 전달
        res.send(feedback);    // 분류결과 정보 전달
      }
    })
  },

  // // GET 'images'
  // image: function (req, res) {
  //   console.log('[GET]    Image Screen (..?)   (in adminAI.js)');
  //   const imageName = req.params.image_num;
  //   db.query(`SELECT class_num, date, img_bf, classified FROM classification`)
  // },

  // // GET 'Download Image'
  // downloadImage: function (req, res) {
  //   console.log('[GET]    Download Image   (in adminAI.js)');
  //   const imageName = req.params.image_name;

  // db.query(`SELECT img_bf FROM classification WHERE `)

  //   const filePath = path.join(__dirname, 'images', image_name);
  //   res.download(filePath);
  // },

  // // GET 'Download Image'
  // downloadImage: function (req, res) {
  //   console.log('[GET]    Download Image   (in adminAI.js)');
  //   const imageName = req.params.image_name;
  //   const mimeType = getMimeType(imageName);
  //   console.log(mimeType);      //   ex) 'image/jpeg'


  //   // 이미지 파일을 Blob으로 변환
  //   const imageNameBuffer = imageName.buffer;
  //   const imageNameBlob = imageNameBuffer.toString('base64');

  //   // DB에서 blob 된 값이 같은 이미지 파일 찾기
  //   db.query(`SELECT img_bf FROM classification WHERE img_bf=?`, [imageNameBlob], function (error, result) {
  //     // error
  //     if (error) {
  //       console.log("Error:: During DB Process");
  //       res.status(500).json("Error:: During DB Process");
  //     }

  //     // Couldn't find data (불러온 데이터가 없음)
  //     if (result.length === 0) {
  //       console.log("There's no information like that");
  //       res.status(404).json("Fail: Login  ::  Couldn't find any data");
  //     }

  //     // 일치하는 이미지 데이터 정상적으로 존재.
  //     else {
  //       res.writeHead(200, {
  //         // 'Content-Type': mimeType,
  //         'Content-Disposition': `attachment; filename="10m_${result.class_num}_${imageName}"` // 다운로드될 파일 이름 설정
  //       });
  //       res.end(imageNameBlob); // 이미지 데이터 전송  (Blob)
  //     }
  //   })
  // },



  // =======================================================================
  // <------------------- AI 모델 관리 및 기록 확인 ---------------------->
  // =======================================================================
  // GET 'AI Page'  (AI 관리 화면)
  aiManagePage: function (req, res) {
    console.log("This is AI PAGE   (in adminAI.js)");

    // classification 결과 총합
    db.query(`SELECT * FROM yolo`, function (error, result) {
      if (error) {
        console.log("Error: in DB!!");
        res.status(500).json("Error: in DB!!");
      }

      if (result.length == 0) {
        console.log("There's no information like that");
        res.status(404).json("Fail: Login  ::  Couldn't find any data");
      }

      else {
        const yolo = result.map((row) => {

          const changeLabels = row.labels ? Buffer.from(row.labels).toString('base64') : null;
          const changeResult = row.result ? Buffer.from(row.result).toString('base64') : null;
          const changeConfusion = row.confusion ? Buffer.from(row.confusion).toString('base64') : null;

          return {
            id: row.ver_num,
            version: row.version,
            isUsed: row.isUsed,
            size: row.size,
            batch: row.batch,
            epochs: row.epochs,
            labels: changeLabels,
            result: changeResult,
            confusion: changeConfusion,
            admin_num: row.admin_num,
            date: row.date,
          };
        });
        console.log(yolo);    // 매뉴얼 정보 전달
        res.send(yolo);    // 매뉴얼 정보 전달
      }
    })
  },

  // POST 'AI Change'  (사용할 AI 모델 변경)
  aiChange: async function (req, res) {
    console.log("This is AI Change   (in adminAI.js)");
    const selectedVersion = req.body.version;
    console.log(">> (aiChange)  selectedVerNum: ", selectedVersion);

    // db.query(`SELECT ver_num FROM yolo WHERE isUsed='Y'`, function (error, result) {
    db.query(`UPDATE yolo SET isUsed='N' WHERE isUsed='Y'`, function (error, result) {
      if (error) {
        console.log("Error :: During 'SELECT' DB");
        return res.status(500).json("Error :: During 'SELECT' DB");
      }
      else {
        db.query(`UPDATE yolo SET isUsed='Y' WHERE version=?`, [selectedVersion], function (error2, result2) {
          if (error2) {
            console.log("Error2 :: During 'SELECT' DB");
            return res.status(500).json("Error2 :: During 'SELECT' DB");
          }
          else {
            console.log("Success Change AI Model!");
            return res.status(200).json("Success Change AI Model!");
          }
        })
      }
    })
  },

  // // POST 'AI Upload'  (AI모델 훈련 데이터셋 추가)
  // aiUpload: async function (req, res) {
  //   console.log("This is AI Upload   (in adminAI.js)");

  // },

  // POST 'AI Training'  (AI 사용 변경 화면)
  aiTraining: async function (req, res) {
    console.log("This is AI Training   (in adminAI.js)");

    var adminId = req.session.login_id;
    var size = req.body.size;
    // let counting = req.body.counting;
    let batch = parseInt(req.body.batch, 10); // '10'은 십진법을 의미
    let epochs = parseInt(req.body.epochs, 10);
    console.log("size: ", req.body.size);
    console.log("batch: ", req.body.batch);
    console.log("batch(int): ", parseInt(req.body.batch, 10));
    console.log("epochs: ", req.body.epochs);
    console.log("epochs(int): ", parseInt(req.body.epochs, 10));
    try {
      // db.query(`SELECT COUNT(ver_num) as counting FROM yolo WHERE size=?`, [size], function (error, result) {
      //   if (error) {
      //     console.log("Error :: During 'SELECT' DB");
      //     return res.status(500).json("Error :: During 'SELECT' DB");
      //   }
      //   else {
      //     console.log("result[0].counting: ", result[0].counting);
      //     counting = result[0].counting;
      //     // const yolo = result.map((row) => {

      //     //   return {
      //     //     id: row.ver_num,
      //     //     version: row.version,
      //     //     isUsed: row.isUsed,
      //     //     size: row.size,
      //     //     batch: row.batch,
      //     //     epochs: row.epochs,
      //     //     cfg: row.cfg,
      //     //     weights: row.weights,
      //     //     file_name: row.file_name,
      //     //     labels: changeLabels,
      //     //     results: changeResults,
      //     //     confusion: changeConfusion,
      //     //     admin_num: row.admin_num,
      //     //     date: row.date,
      //     //   };
      //     // });

      //     // console.log("YOLO :: ", yolo);

      //     // size = yolo.size;
      //     // batch = yolo.batch;
      //     // epochs = yolo.epochs;
      //     // cfg = `/home/t23201/svr/v1.0/AI/yolov5/models/yolov5${size}.yaml`;
      //     // weights = `yolov5${size}.pt`;
      //     // name = `trash_yolov5${size}_results`;

      //     // console.log(cfg);
      //     // console.log(weights);
      //     // console.log(name);
      //   }
      // })
      console.log(">> (aiTraining)  afterDB =============");
      // console.log(cfg);
      // console.log(weights);
      // console.log(name);
      // const result = await AiTraining(batch, epochs, cfg, weights, name);
      const trainingResult = await AiTraining(size, batch, epochs);

      console.log("======+++===== result: ", trainingResult);

      const imagePath1 = `/home/t23201/svr/v1.0/AI/yolov5/runs/train/${trainingResult}/labels.jpg`; // lable
      const imagePath2 = `/home/t23201/svr/v1.0/AI/yolov5/runs/train/${trainingResult}/results.png`; // result
      const imagePath3 = `/home/t23201/svr/v1.0/AI/yolov5/runs/train/${trainingResult}/confusion_matrix.png`; // confusion
      let blob1, blob2, blob3;

      console.log("imagePath1 :: ", imagePath1);
      console.log("imagePath2 :: ", imagePath2);
      console.log("imagePath3 :: ", imagePath3);

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

        db.query(`SELECT admin_num FROM admin WHERE id=?`, [adminId], function (error, result) {
          if (error) {
            console.log('Error: Cannot SELECT FROM  DB :: error :: ', error);
            res.status(500).json('Fail: DB ERROR. - SELECT');
          }
          else {
            const adminNum = result[0].admin_num;

            console.log("result[0].admin_num :: ", result[0].admin_num);
            db.query(`INSERT INTO yolo (version, size, batch, epochs, labels, result, confusion, admin_num) values (?, ?, ?, ?, ?, ?, ?, ?) `,
              [trainingResult, size, batch, epochs, blob1, blob2, blob3, adminNum], function (error2, result2) {
                if (error2) {
                  console.log('Error: Cannot INSERT INTO DB :: error2 :: ', error2);
                  res.status(500).json('Fail: DB ERROR.  - INSERT');
                }
                else {
                  console.log('Success saving Trained AI !!');
                  res.status(200).json('!! ~~ Success saving Trained AI ~~ !!');
                }
              })
          }
        })
      })

      // const labelsPath = path.join('/home/t23201/svr/v1.0/AI/yolov5/runs/train/', trainingResult, '/labels.jpg');
      // const resultsPath = path.join('/home/t23201/svr/v1.0/AI/yolov5/runs/train', trainingResult, 'results.png');
      // const confusionPath = path.join('/home/t23201/svr/v1.0/AI/yolov5/runs/train', trainingResult, 'confusion_matrix.png');
      // console.log("labelsPath: ", labelsPath);
      // console.log("resultsPath: ", resultsPath);


      // // 파일들을 비동기적으로 읽습니다.
      // const labelsData = await fsPromises.readFile(labelsPath);
      // const resultsData = await fsPromises.readFile(resultsPath);
      // const confusionData = await fsPromises.readFile(confusionPath);


      // // Base64 인코딩
      // const labelsBase64 = labelsData.toString('base64');
      // const resultsBase64 = resultsData.toString('base64');
      // const confusionBase64 = confusionData.toString('base64');

      // console.log(" !!~~ Succsess AI Training ~~ !!")
      // db.query(`SELECT admin_num FROM admin WHERE id=?`, [adminId], function (error, result) {
      //   if (error) {
      //     console.log('Error: Cannot SELECT FROM  DB :: error :: ', error);
      //     res.status(500).json('Fail: DB ERROR. - SELECT');
      //   }
      //   else {
      //     const adminNum = result[0].admin_num;

      //     console.log("result[0].admin_num :: ", result[0].admin_num);
      //     db.query(`INSERT INTO yolo SET version=?, size=?, batch=?, epochs=?, labels=?, result=?, confusion=?, admin_num=?`,
      //       [trainingResult, size, batch, epochs, labelsBase64, resultsBase64, confusionBase64, adminNum], function (error2, result2) {
      //         if (error2) {
      //           console.log('Error: Cannot INSERT INTO DB :: error2 :: ', error2);
      //           res.status(500).json('Fail: DB ERROR.  - INSERT');
      //         }
      //         else {
      //           console.log('Success saving Trained AI !!');
      //           res.status(200).json('!! ~~ Success saving Trained AI ~~ !!');
      //         }
      //       })
      //   }
      // })
    }
    catch (error) {
      console.error('AI Training failed:', error);
      res.status(500).json({ message: "Training failed" });
    }
  },
}
