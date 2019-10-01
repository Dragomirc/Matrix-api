const express = require('express');
const { isAuth } = require('../middleware/is-auth');
const imageHandler = require('../controllers/image');
const router = express.Router();

router.get('/presigned-url', isAuth, imageHandler.getPresignedUrl);

module.exports = router;
