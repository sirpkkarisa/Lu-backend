const uuid = require('uuid');
const pool = require('../middlewares/config-pool');

exports.createComment = (req, res) => {
  const commentId = uuid.v4();
  const { articleId } = req.params;
  const {  comment, authorId } = req.body;
  
  if (articleId === undefined || comment === undefined || authorId === undefined) {
      return res.status(400)
      .json({
          status: 'error',
          error: 'All fields are required',
      })
  }
pool.query(`SELECT * FROM lu_users WHERE user_id='${authorId}'`)
     .then(
     ({rows}) => {
            if (rows.length === 0) {
                return res.status(401)
                .json({
                    status: 'error',
                    error: 'Unauthorized',
                })
            }
          pool.query('INSERT INTO lu_comments VALUES($1,$2,$3,$4)', [commentId, articleId, comment, authorId])
         .then(
             () => {
         pool.query('SELECT * FROM lu_comments WHERE comment_id=$1', [commentId])
            .then(
            ({ rows }) => {
              if (rows.length === 0) {
                return res.status(403)
                  .json({
                    status: ' error',
                    error: 'Forbidden',
                  });
              }
              return res.status(200)
                .json({
                  status: 'success',
                  data: {
                    message: 'you have successfully added a comment!',
                    comment: rows,
                  },
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
}
    )
    .catch(
        (error) => {
            res.status(500)
            .json({
                status: 'error',
                error: `${error}`
            })
        }
    )
  
};
exports.getComments = (req, res) => {
  pool.query('SELECT * FROM lu_comments')
    .then(
      ({ rows }) => {
        if (rows.length === 0) {
          return res.status(404)
            .json({
              status: 'error',
              error: 'No comments',
            });
        }
        return res.status(200)
          .json({
            status: 'success',
            data: rows,
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
    );
};
exports.getComment = (req, res) => {
  const { commentId } = req.params;
  pool.query('SELECT * FROM lu_comments WHERE comment_id=$1', [commentId])
    .then(
      ({ rows }) => {
        if (rows.length === 0) {
          return res.status(404)
            .json({
              status: 'error',
              error: 'comment Not Found',
            });
        }
        return res.status(200)
          .json({
            status: 'success',
            data: rows,
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
    );
};

exports.deleteComment = (req, res) => {
  const { commentId } = req.params;
  const { authorId } = req.body;
  pool.query(`SELECT * FROM lu_comments WHERE comment_id='${articleId}' AND author_id='${authorId}'`)
    .then(
      ({ rows }) => {
        if (rows.length === 0) {
          return res.status(401)
            .json({
              status: 'error',
              error: 'Unauthorized',
            });
        }
        return pool.query(`DELETE FROM lu_comments WHERE comment_id='${articleId}' AND author_id='${authorId}'`)
          .then(
            () => {
              res.status(200)
                .json({
                  status: 'success',
                  data: {
                    message: 'comment successfully deleted',
                  },
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
