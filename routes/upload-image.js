const express = require('express');
const uuid = require('uuid/v4');
const aws = require('aws-sdk');
const { isAuth } = require('../middleware/is-auth');
const router = express.Router();

const s3 = new aws.S3({
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  signatureVersion: 'v4',
  region: 'eu-west-2'
});

router.get('/presigned-url', isAuth, async (req, res, next) => {
  const { userId } = req;
  const key = `${userId}/${uuid()}.jpg`;
  const params = {
    Bucket: process.env.IMAGE_UPLOAD_BUCKET_NAME,
    Key: key,
    ContentType: 'image/jpeg'
  };
  try {
    const preSignedUrl = await s3.getSignedUrl('putObject', params);
    res.status(200).json({ preSignedUrl });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
});

module.exports = router;
