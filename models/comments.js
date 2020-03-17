const pool = require('../middlewares/config-pool');

exports.commentsTable= () => {
  pool.query(`
    CREATE TABLE IF NOT EXISTS
    lu_comments(
        comment_id UUID,
        article_id UUID NOT NULL,
        comment TEXT NOT NULL,
        author_id UUID NOT NULL,
        created_on TIMESTAMP DEFAULT NOW(),
        PRIMARY KEY(comment_id)
    )
    `)
    .catch(
      (error) => {
        console.log(error);
      },
    );
};
