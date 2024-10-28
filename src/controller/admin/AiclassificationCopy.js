const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

module.exports = {
  AiClassification: function (inputImage) {
    var modelVersion = 'trash_yolov5m_results3';
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
    //   fs.writeFileSync('./model/textOutputs/output.txt', stdoutStr);

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