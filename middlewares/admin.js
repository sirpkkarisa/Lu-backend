module.exports = (req, res, next) => {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decodedToken = new Buffer.from(token, 'base64').toString().split(':');
      const username = decodedToken[0];
      const password = decodedToken[1];
      if (password !== process.env.ADM_PASSWORD || username !== process.env.USERS) {
       return res.status(401)
          .json({
            status: 'error',
            error: 'Unauthorized',
          });
      }
      return  next();
    } catch (error) {
      res.status(401)
        .json({
            status: 'error',
            error: 'Unauthorized',
        });
    }
  };
  