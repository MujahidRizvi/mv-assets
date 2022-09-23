import jwt from 'jsonwebtoken';

module.exports = (req, res, next) => {
  const authHeader = req.get('Authorization');
  if (!authHeader) {
    throw new Error('Not authenticated.');
  }
  const token = authHeader.split(' ')[1];
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, process.env.JWT_TOKEN_KEY);
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }
  if (!decodedToken) {
    throw new Error('Not authenticated.');
  }
  req.userId = decodedToken.userId;
  next();
};
