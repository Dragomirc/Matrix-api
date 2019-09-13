exports.setAuthHeader = (req, res, next) => {
  const { accessToken } = req.cookies;
  if (accessToken) {
    req.headers.authorization = `Bearer ${accessToken}`;
  }
  next();
};
