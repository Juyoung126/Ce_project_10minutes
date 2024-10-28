const express = require('express');
const app = express();
const port = 60001;   // port number
const aiRouter = require('/home/t23201/svr/v1.0/src/model/aiCopy.js');

app.get('/aiTest', function (req, res) {
  console.log("AI TEST")
  aiRouter.aiControl(req, res);
});

app.listen(port, () => {
  console.log("Start Listening ------")
});