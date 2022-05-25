/* eslint-disable @typescript-eslint/no-var-requires */

// 该文件部署在serverless上面 https://console.cloud.tencent.com/scf/index
const express = require('express');
const path = require('path');
const fs = require('fs');
const fetch = require('node-fetch');

const app = express();

// 解决跨域
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Authorization,X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Request-Method',
  );
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PATCH, PUT, DELETE');
  res.header('Allow', 'GET, POST, PATCH, OPTIONS, PUT, DELETE');
  next();
});

const getUrlQuery = (params) => {
  return Object.keys(params)
    .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`)
    .join('&');
};

app.get(`/`, (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get(`/figma/file`, async (req, res) => {
  const { token, havePath, isNodes, depth, ids, authToken, fileUrl, type = 'personalToken' } = req.query;

  const fileArr = fileUrl.split('https://www.figma.com/file/');
  const fileKey = fileArr[1].split('/')[0];

  const params = {};
  if (havePath === 'true') {
    params.geometry = 'paths';
  }
  if (depth && depth > 0) {
    params.depth = depth;
  }

  if (ids === 'true') {
    params.ids = ids;
  }

  const headers = {};
  if (type === 'personalToken') {
    headers['X-Figma-Token'] = token;
  } else if (type === 'authToken') {
    headers.Authorization = `Bearer ${authToken}`;
  }
  const response = await fetch(
    `https://api.figma.com/v1/files/${fileKey}${isNodes === 'true' ? '/nodes' : ''}?${getUrlQuery(params)}`,
    {
      headers,
    },
  );
  const files = await response.json();

  res.send({
    code: 200,
    data: files,
    message: '获取成功',
  });
});

app.get(`/figma/auth`, async (req, res) => {
  const { code, redirectUri } = req.query;

  console.log(code);
  const params = {
    client_id: 'Hn8ZQBrB9AOZaGqPTRZ1w9',
    client_secret: '9FTpKbh1ASYgdHt4SbbrkGPRT0Q9bK',
    code,
    grant_type: 'authorization_code',
    redirect_uri: redirectUri,
  };

  const response = await fetch(`https://www.figma.com/api/oauth/token?${getUrlQuery(params)}`, {
    method: 'POST',
  });
  const result = await response.json();
  res.send({
    code: 200,
    data: result,
    message: '获取成功',
  });
});

app.get(`/logo`, (req, res) => {
  const logo = path.join(__dirname, 'logo.png');
  const content = fs.readFileSync(logo, {
    encoding: 'base64',
  });
  res.set('Content-Type', 'image/png');
  res.send(Buffer.from(content, 'base64'));
  res.status(200).end();
});

// Web 类型云函数，只能监听 9000 端口
app.listen(9000, () => {
  console.log(`Server start on http://localhost:9000`);
});
