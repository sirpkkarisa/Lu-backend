const pool = require('../middlewares/config-pool');
const bcrypt = require('bcrypt');
const uuid = require('uuid');
const jwt = require('jsonwebtoken');

exports.createUser = (req, res) => {
    const userId = uuid.v4();
    const { firstName } = req.body;
    const { lastName } = req.body;
    const { email } = req.body;
    const { gender } = req.body;
    const { regNo } = req.body;
    const { password } = req.body;
    const { degreeCourse } = req.body;

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
    const { uid } = req.body;
    const { password } = req.body;
    
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