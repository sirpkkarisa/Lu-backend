const pool = require('../middlewares/config-pool');
const bcrypt = require('bcrypt');
const uuid = require('uuid');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const transporter = nodemailer.createTransport({
    // host: 'gsmtp.gmail.com',
    service:'gmail',
    auth: {
       user: process.env.NODEMAILER_USER,
       pass: process.env.NODEMAILER_PASSWORD
    }
})

exports.createUser = (req, res) => {
    const userId = uuid.v4();
    const { firstName, lastName, email, gender, regNo, password, degreeCourse } = req.body;
    if (firstName === undefined || lastName === undefined || email === undefined || gender === undefined || regNo === undefined || password === undefined || degreeCourse === undefined ) {
        return res.status(400)
            .json({
                status: 'error',
                error: 'All fields are required',
            });
    }
    
    return bcrypt.hash(password, 10)
        .then(
            (hash) => {
                pool.query('INSERT INTO lu_users VALUES($1, $2, $3, $4, $5, $6, $7, $8)',[userId, firstName, lastName, email, gender, regNo, hash, degreeCourse])
                .then(
                    () => {
                        res.status(201)
                        .json({
                            status: 'success',
                            data : {
                                message: 'User has been successfully added',
                                userId,
                            }
                        })
                    }
                )
                .catch(
                    (error) => {
                        res.status(501)
                        .json({
                            status: 'error',
                            error: `${error}`,
                        })
                    }
                )
            }
        )
        .catch(
            (error) => {
                res.status(500)
                .json({
                    status: 'error',
                    error: `${error}`,
                });
            }
        );
};
exports.signIn =(req, res) => {
    const { uid, password } = req.body;
    
    if (uid === undefined || password === undefined) {
        return res.status(401)
        .json({
            status: 'error',
            error: 'Unauthorized',
        })
    }
    pool.query(`SELECT * FROM lu_users WHERE email='${uid}' OR reg_no='${uid}'`)
    .then(
        ({rows}) => {
            if (rows.length === 0) {
                return res.status(401)
                .json({
                    status: 'error',
                    error: 'Unauthorized',
                });
            }
            const hashedPass = rows.map((data) => data.password).toString();
            const dbId = rows.map((data) => data.user_id).toString();
            bcrypt.compare(password, hashedPass)
            .then(
                (valid) => {
                    if (!valid) {
                        return res.status(401)
                        .json({
                            status: 'error',
                            error: 'Unauthorized',
                        })
                    }
                    const token = jwt.sign(
                        {userId: dbId},
                        process.env.TOKEN,
                        {expiresIn: '1hr'}
                    )
                    res.status(200)
                    .json({
                        status: 'success',
                        data: {
                            userId: dbId,
                            token,
                        }
                    })
                }
            )
            .catch(
                (error) => {
                    res.status(501)
                    .json({
                        status: 'error',
                        error: `${error}`,
                    })
                }
            )
        }
    )
    .catch(
        (error) => {
            res.status(501)
            .json({
                status: 'error',
                error: `${error}`
            })
        }
    )
}
exports.changePassword = (req, res) => {
    // This can either be email or registeration number
    const { uid, currentPassword, newPassword } = req.body;

    if (uid === undefined || currentPassword === undefined || newPassword === undefined) {
      return res.status(400)
        .json({
          status: 'error',
          error: 'All fields are required',
        });
    }
    pool.query(`SELECT * FROM lu_users WHERE email='${uid}' OR reg_no='${uid}'`)
      .then(
        ({ rows }) => {
          if (rows.length === 0) {
            return res.status(401)
              .json({
                status: 'error',
                error: 'Unauthorized',
              });
          }
          const dbPassword = rows.map((data) => data.password).toString();
          return bcrypt.compare(currentPassword, dbPassword)
            .then(
              (valid) => {
                if (!valid) {
                  return res.status(401)
                    .json({
                      status: 'error',
                      error: 'Unauthorized',
                    });
                }
                return bcrypt.hash(newPassword, 10)
                  .then(
                    (hash) => pool.query(`UPDATE lu_users SET password='${hash}' WHERE (email='${uid}' OR reg_no='${uid}')`)
                      .then(
                        () => {
                          res.status(200)
                            .json({
                              status: 'success',
                              message: 'Password has been successfully changed',
                            });
                        },
                      )
                      .catch(
                        (error) => {
                          res.status(501)
                            .json({
                              status: 'error',
                              error: `${error}`,
                            });
                        },
                      ),
                  )
                  .catch(
                    (error) => {
                      res.status(501)
                        .json({
                          status: 'error',
                          error: `${error}`,
                        });
                    },
                  );
              },
            );
        },
      )
      .catch(
        (error) => {
          res.status(501)
            .json({
              status: 'error',
              error: `${error}`,
            });
        },
      );
  };
  
  exports.forgotPassword = (req, res) => {
    const resetPasswordToken = crypto.randomBytes(20).toString('hex');
    const { email } = req.body;
    const mailOptions = {
      from: `${process.env.NODEMAILER_USER}`,
      to: `${email}`,
      subject: 'Link To Reset Password',
      text: 'You are receiving this email because either you( or someone else) have requested to change password\n'
          + 'If you did not request, please ignore and your password for LU Social Net will remain unchaged\n'
          + 'Click the link below to reset password\n\n'
          + `http://localhost:5000/${resetPasswordToken}.`,
    };
    pool.query(`SELECT * FROM lu_users WHERE email='${email}'`)
      .then(
        ({ rows }) => {
          if (rows.length === 0) {
            return res.status(401)
              .json({
                status: 'error',
                error: 'Unauthorized',
              });
               }
          return pool.query(`UPDATE lu_users SET reset_password_token='${resetPasswordToken}' WHERE email='${email}'`)
            .then(
              () => {
                transporter.sendMail(mailOptions, (error, response) => {
                  if (error) {
                    return res.status(500)
                      .json({
                        status: 'error',
                        error: `${error}`,
                      });
                  }
                  console.log('Response', response);
                  return res.status(200)
                    .json({
                      status: 'success',
                      data: {
                        message: 'Recovery Link Sent',
                        resetPasswordToken,
                      },
                    });
                });
              },
            )
            .catch(
              (error) => {
                res.status(500)
                  .json({
                    status: 'error',
                    error: `${error}`,
                  });
              },
            );
        },
      )
      .catch(
        (error) => {
          res.status(500)
            .json({
              status: 'error',
              error: `${error}`,
            });
        },
      );
  };
  
  exports.resetPassword = (req, res) => {
    const { password } = req.body;
    const { resetPasswordToken } = req.body;
  
    pool.query(`SELECT * FROM lu_users WHERE reset_password_token='${resetPasswordToken}'`)
      .then(
        ({ rows }) => {
          if (!rows) {
            return res.status
              .json({
                status: 'error',
                error: 'Forbidden',
              });
          }
          const email = rows.map((data) => data.email).toString();
          return bcrypt.hash(password, 10)
            .then(
              (hash) => pool.query(`UPDATE lu_users SET password='${hash}', reset_password_token=null WHERE email='${email}'`)
                .then(
                  () => {
                    res.status(200)
                      .json({
                        status: 'success',
                        message: 'Password has successfully been reset',
                      });
                  },
                )
                .catch(
                  (error) => {
                    res.status(500)
                      .json({
                        status: 'error',
                        error: `${error}`,
                      });
                  },
                ),
            )
            .catch(
              (error) => {
                res.status(501)
                  .json({
                    status: 'error',
                    error: `${error}`,
                  });
              },
            );
        },
      )
      .catch(
        (error) => {
          res.status(501)
            .json({
              status: 'error',
              error: `${error}`,
            });
        },
      );
  };
  