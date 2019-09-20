const jwt = require('jsonwebtoken');

exports.isAuth = (req, res, next) => {
  const authHeader = req.get('Authorization');
  if (!authHeader) {
    const error = new Error('Not Authenticated no authHeadr.');
    error.statusCode = 401;
    throw error;
  }
  const token = authHeader.split(' ')[1];
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, process.env.SECRET);
  } catch (error) {
    error.statusCode = 401;
    throw error;
  }
  if (!decodedToken) {
    const error = new Error('Not Authenticated no decodedToken.');
    error.statusCode = 401;
    throw error;
  }
  req.userId = decodedToken.userId;
  if (req.cookies.accessToken) {
    const accessToken = jwt.sign(
      { userId: decodedToken.userId },
      process.env.SECRET,
      {
        expiresIn: 60 * 30
      }
    );

    const options = {
      // secure: true,
      httpOnly: true,
      sameSite: true
    };

    res.cookie('accessToken', accessToken, options);
  }
  next();
};
