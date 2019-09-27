const express = require('express');
const aws = require('aws-sdk');
const router = express.Router();

const s3 = new aws.S3({
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY
});
router.get('/presigned-url', (req, res, next) => {});

module.exports = router;
