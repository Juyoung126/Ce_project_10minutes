const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

module.exports = {
  AiClassification: function (inputImage) {
    var modelVersion = 'trash_yolov5m_results2';
    var runScript = `python ../AI/yolov5/detect.py --weight ../AI/yolov5/runs/train/${modelVersion}/weights/best.pt --img 640 --conf 0.4 --source ./model/inputs/${inputImage}`;

    try {
      let stdout = execSync(runScript);
      // let { stdout, stderr } = execSync(runScript, { encoding: 'buffer' });

      let stdoutStr = stdout.toString();
      // let stdoutStr = stdout ? stdout.toString() : '';
      // let stderrStr = stderr ? stderr.toString() : '';

      console.log("**~~** stdoutStr: ", stdoutStr);
      // console.log("**~~** stderr: ", stderrStr);



      // // 텍스트 결과 저장
      // // fs.writeFileSync('./model/textOutputs/output.txt', stdout);
      // fs.writeFileSync('./model/textOutputs/output.txt', stdoutStr);

      // 최신 폴더 탐색 함수
      function findLatestExpFolder(basePath) {
        const dirs = fs.readdirSync(basePath).filter(f => fs.statSync(path.join(basePath, f)).isDirectory());
        const expDirs = dirs.filter(dir => dir.startsWith('exp'));
        const sortedExpDirs = expDirs.sort((a, b) => {
          const numA = parseInt(a.match(/\d+/)[0], 10);
          // const numB = parseInt(b.match(/\d+/)[0], 10);
          const numBMatch = b.match(/\d+/);
          const numB = numBMatch ? parseInt(numBMatch[0], 10) : 0;
          return numB - numA; // 내림차순 정렬
        });
        return sortedExpDirs[0]; // 가장 최신 폴더
      }

      const latestExpFolder = findLatestExpFolder('../AI/yolov5/runs/detect/');

      // 텍스트 결과 저장
      // fs.writeFileSync('./model/textOutputs/output.txt', stdout);
      fs.writeFileSync(`./model/textOutputs/output_${latestExpFolder}_${modelVersion}.txt`, stdoutStr);

      // 검출된 이미지 파일 처리
      var detectedImage = `${inputImage}`;
      const imagePath = `../AI/yolov5/runs/detect/${latestExpFolder}/${detectedImage}`;

      var savedImagePath = `./model/outputs/${latestExpFolder}_${modelVersion}_${inputImage}`
      fs.copyFileSync(imagePath, savedImagePath);

      // return s
      return { savedImagePath: savedImagePath, detectionResult: stdoutStr };

    } catch (error) {
      console.error(`실행 오류: ${error}`);
      throw error; // 오류를 호출자에게 전파
    }
  }
}



// ===================================================================================================
// ======================== exec 비동기 방식 (돌아는 감. 다만, return이 잘 안 됨) =======================
// ===================================================================================================
// const { model } = require('@tensorflow/tfjs-node');
// const { exec } = require('child_process');
// const fs = require('fs');
// const path = require('path');

// module.exports = {
//   AiClassification: function (request) {
//     // Python 스크립트 실행
//     var requestImage = request      // 'fromChrome2.jpg'
//     var modelVersion = 'trash_yolov5s_results10'     // 'fromChrome2.jpg'
//     var runScript = `python ../AI/yolov5/detect.py --weight ../AI/yolov5/runs/train/${modelVersion}/weights/best.pt --img 640 --conf 0.4 --source ./model/inputs/${requestImage}`
//     // var runScript = `python ../AI/yolov5/detect.py --weight ../AI/yolov5/runs/train/${modelVersion}/weights/best.pt --img 640 --conf 0.4 --source ./data/images/${requestImage}.jpg`
//     // var runScript = `python ./detect.py --weight ./runs/train/trash_yolov5s_results10/weights/best.pt --img 640 --conf 0.4 --source ./data/images/fromChrome2.jpg`
//     // exec(`python ./detect.py --weight ./runs/train/trash_yolov5s_results10/weights/best.pt --img 640 --conf 0.4 --source ./data/images/fromChrome2.jpg`, (error, stdout, stderr) => {

//     exec(runScript, (error, stdout, stderr) => {
//       if (error) {
//         console.error(`실행 오류: ${error}`);
//         return;
//       }
//       if (stderr) {
//         console.error(`오류 메시지: ${stderr}`);
//         return;
//       }

//       // 텍스트 결과 저장
//       fs.writeFile('./model/textOutputs/output.txt', stdout, (err) => {
//         if (err) throw err;
//         console.log('텍스트 결과가 output.txt에 저장되었습니다.');
//       });

//       function findLatestExpFolder(basePath) {
//         const dirs = fs.readdirSync(basePath).filter(f => fs.statSync(path.join(basePath, f)).isDirectory());
//         const expDirs = dirs.filter(dir => dir.startsWith('exp'));
//         const latestExpDir = expDirs.sort().reverse()[0];
//         return latestExpDir;
//       }

//       const latestExpFolder = findLatestExpFolder('./runs/detect');

//       // 이미지 결과 처리
//       // 이미지 파일 경로는 Python 스크립트의 결과 또는 미리 정의된 경로를 사용합니다.
//       var detectedImage = `detected_${requestImage}.jpg`; // 예시 경로
//       const imagePath = `runs/detect/${latestExpFolder}/${detectedImage}`;
//       // const imagePath = `runs/detect/exp19/${detectedImage}`; // 예시 경로
//       // const imagePath = 'runs/detect/exp19/detected_image.jpg'; // 예시 경로

//       var savedImagePath = `./model/outputs/saved_${requestImage}.jpg`
//       fs.copyFile(imagePath, savedImagePath, (err) => {
//         if (err) throw err;
//         console.log('이미지 결과가 saved_~~.jpg에 저장되었습니다.');
//       });

//       return stdout;
//     });
//   }
// }



// //========================================================================
// //============================ Tensorflow.js =============================
// //========================================================================
// // const tf = require('@tensorflow/tfjs-node');
// // const fs = require('fs');

// // let model;

// // async function loadModel() {
// //   // !! model 변수에 저장된 AI 모델이 없으면 추가. !!
// //   // !! 아마도 모델 버전(?) 선택하는 과정이 필요할것같은데...? !!
// //   if (!model) {
// //     // !! 변환된 모델 파일 경로 !!
// //     const modelPath = 'file://path/to/converted/model.json';
// //     model = await tf.loadLayersModel(modelPath);
// //   }
// //   return model;
// // }

// // // !! image를 받아오면 Object Detection 실행. !!
// // async function detectObjects(imageBuffer) {
// //   // !! 사용할 model을 가져온다. !!
// //   const loadedModel = await loadModel();

// //   // !! 이미지 처리 및 모델에 적용 !!
// //   const tensor = tf.node.decodeImage(imageBuffer, 3)    // 3: RGB (image's channel num)
// //     .resizeNearestNeighbor([640, 640]) // 모델 입력 크기에 맞춰 조정
// //     .expandDims(0)
// //     .toFloat();
// //   const prediction = loadedModel.predict(tensor);

// //   // !! 예측 결과 처리 !!
// //   // ...

// //   return prediction;
// // }

// // // !! 서버측에서 이 코드를 실행할 수 있도록 AiClassfication 이라는 함수로 묶에서 module exports !!
// // async function AiClassification(imagePath) {
// //   // 이미지 파일 로드 및 객체 탐지
// //   const imageBuffer = fs.readFileSync(imagePath);
// //   const prediction = await detectObjects(imageBuffer);

// //   // !! 예측 결과 반환 !!
// //   return prediction;
// // }

// // module.exports = AiClassification;
