const pool = require('../middlewares/config-pool');

exports.articlesTable = () => {
  pool.query(`
    CREATE TABLE IF NOT EXISTS
    lu_articles(
        article_id UUID,
        article_title VARCHAR(255) NOT NULL,
        article TEXT NOT NULL,
        author_id UUID NOT NULL,
        created_on TIMESTAMP DEFAULT NOW(),
        PRIMARY KEY(article_id)
    )
    `)
    .catch(
      (error) => {
        console.log(error);
      },
    );
};
