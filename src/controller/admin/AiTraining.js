const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// const training_epochs = 60; // 훈련 epoch 수를 저장한 변수
let trainingEpochs;
// let sizeAI;

// aiTraining 함수는 이제 프로미스를 반환합니다
// async function AiTraining(batch, epochs, cfg, weights, name) {
// async function AiTraining(size, batch, epochs, cfg, weights, name) {
async function AiTraining(size, batch, epochs) {
  console.log(">> (AiTraining)  in Ai.Training.js ===============");
  trainingEpochs = epochs;


  function findLatestResultsFolder(basePath) {
    const dirs = fs.readdirSync(basePath).filter(f => fs.statSync(path.join(basePath, f)).isDirectory());
    const resDir = `trash_yolov5${size}_results`;
    const resultsDirs = dirs.filter(dir => dir.startsWith(resDir));
    if (!resultsDirs.length) {
      console.error('No results folders found.');
      return null;
    }
    const sortedResultsDirs = resultsDirs.sort((a, b) => {
      const numA = a.match(/\d+$/) ? parseInt(a.match(/\d+$/)[0], 10) : 0;
      const numB = b.match(/\d+$/) ? parseInt(b.match(/\d+$/)[0], 10) : 0;
      // const numA = parseInt(a.split('_').pop()) || -1; // 폴더 이름의 마지막 부분에서 숫자 추출, 숫자가 없다면 -1
      // const numB = parseInt(b.split('_').pop()) || -1; // 폴더 이름의 마지막 부분에서 숫자 추출, 숫자가 없다면 -1

      // console.log("\n\n+++++++++++++++ a & b :: ", a, b);
      // console.log("+++++++++++++++ numA & numB :: ", numA, numB);

      // const matchA = a.match(/\d+/);
      // const matchB = b.match(/\d+/);
      // const numA = matchA ? parseInt(matchA[0], 10) : -1; // 숫자가 없는 경우 -1
      // const numB = matchB ? parseInt(matchB[0], 10) : -1; // 숫자가 없는 경우 -1
      // const numA = a.match(/\d+/) ? parseInt(a.match(/\d+/)[0], 10) : 0;
      // const numB = b.match(/\d+/) ? parseInt(b.match(/\d+/)[0], 10) : 0;
      // const numA = parseInt(a.split('_').pop(), 10); // 폴더 이름의 마지막 부분에서 숫자 추출
      // const numB = parseInt(b.split('_').pop(), 10); // 폴더 이름의 마지막 부분에서 숫자 추출
      // const numA = parseInt(a.match(/\d+/)[0], 10);
      // // const numB = parseInt(b.match(/\d+/)[0], 10);
      // const numBMatch = b.match(/\d+/);
      // const numB = numBMatch ? parseInt(numBMatch[0], 10) : 0;
      return numB - numA; // 내림차순 정렬
    });
    // const sortedResultsDirs = resultsDirs.sort((a, b) => {
    //   const numA = parseInt(a.replace(/^\D+/g, ''), 10);
    //   const numB = parseInt(b.replace(/^\D+/g, ''), 10);
    //   return numB - numA; // 내림차순 정렬
    // });
    console.log('Latest Results folder:', sortedResultsDirs[0]);
    return sortedResultsDirs[0]; // 가장 최신 폴더
  }

  const basePath = '/home/t23201/svr/v1.0/AI/yolov5/runs/train';


  return new Promise((resolve, reject) => {
    // train.py 스크립트 실행
    // const scriptPath = '/AI/yolov5/train.py';
    // const script = `python /home/t23201/svr/v1.0/AI/yolov5/train.py --img 64 --batch ${batch} --epochs ${epochs} --cfg ${cfg} --weights ${weights} --name ${name}`;
    const script = `python /home/t23201/svr/v1.0/AI/yolov5/train.py --img 64 --batch ${batch} --epochs ${epochs} --cfg /home/t23201/svr/v1.0/AI/yolov5/models/yolov5${size}.yaml --weights /home/t23201/svr/v1.0/AI/yolov5/yolov5${size}.pt --name trash_yolov5${size}_results`;
    console.log("Trainig Script :: ", script);

    exec(script, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
      if (error) {
        console.error(`Execution error: ${error}`);
        return reject(error);
      }
      console.log(`stdout: ${stdout}`);
      if (stderr) console.error(`stderr: ${stderr}`);

      const latestResultsFolder = findLatestResultsFolder(basePath);
      console.log("\n\n==>> latestResultsFolder: ", latestResultsFolder);

      console.log("before the checkTrainingCompletion function");

      // Python 스크립트 실행 후 결과 파일 확인 시작
      checkTrainingCompletion(resolve, reject, latestResultsFolder);

      console.log("after the checkTrainingCompletion function");

    });
  });
}

function checkTrainingCompletion(resolve, reject, latestResultsFolder) {
  console.log("in the checkTrainingCompletion function");
  console.log("in the checkTrainingCompletion function (latestResultsFolder) :: ", latestResultsFolder);
  const resultsPath = `/home/t23201/svr/v1.0/AI/yolov5/runs/train/${latestResultsFolder}/results.csv`;
  const checkInterval = 10000; // 5초마다 확인
  let checkIntervalId = setInterval(() => {
    fs.readFile(resultsPath, 'utf8', (err, data) => {
      if (err) {
        console.error('Error reading the results file:', err);
        clearInterval(checkIntervalId);
        return reject(err);
      }
      const csvEpochs = parseEpochs(data);
      console.log("csvEpochs :: ", csvEpochs);
      if ((csvEpochs + 1) >= trainingEpochs) {
        console.log('Training completed successfully.');
        clearInterval(checkIntervalId);
        resolve(latestResultsFolder); // 훈련 완료를 resolve로 알림
      }
    });
  }, checkInterval);
}

function parseEpochs(csvData) {
  console.log("in the parseEpochs function");

  const lines = csvData.split('\n');
  const lastLine = lines.reverse().find(line => line.trim() !== '');
  const lastEpoch = lastLine.split(',')[0];
  console.log(parseInt(lastEpoch, 10));
  return parseInt(lastEpoch, 10);
}

module.exports = { AiTraining };