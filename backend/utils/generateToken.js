import jwt from 'jsonwebtoken';

const generateToken = (id) => {
  // jwt.sign takes 3 things: the data payload, your secret key, and options
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d', // The user will stay logged in for 30 days
  });
};

export default generateToken;