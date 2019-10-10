const aws = require('aws-sdk');

const s3 = new aws.S3({
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  signatureVersion: 'v4',
  region: 'eu-west-2'
});

exports.getPresignedUrl = async (req, res, next) => {
  const { userId } = req;
  const { filename } = req.query;
  const key = `${userId}/${Date.now().toString()}-${filename}.jpeg`;
  const params = {
    Bucket: process.env.IMAGE_UPLOAD_BUCKET_NAME,
    Key: key,
    ContentType: 'image/jpeg'
  };
  try {
    const preSignedUrl = await s3.getSignedUrl('putObject', params);
    res.status(200).json({ preSignedUrl, fileName: key });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.clearImage = (filePath, next) => {
  const params = {
    Bucket: process.env.IMAGE_UPLOAD_BUCKET_NAME,
    Key: filePath
  };

  s3.deleteObject(params, err => {
    if (err) return next(err);
    else console.log(`Image suggessfully deleted`);
  });
};
