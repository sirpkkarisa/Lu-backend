const pool = require('../middlewares/config-pool');

exports.documentsTable = () => {
    pool.query(`
    CREATE TABLE IF NOT EXISTS
    documents(
        doc_id UUID,
        doc_title VARCHAR(255) NOT NULL,
        doc_url VARCHAR(255) NOT NULL,
        author_id UUID NOT NULL,
        created_on TIMESTAMP DEFAULT NOW(),
        PRIMARY KEY(doc_id)
    )
    `)
    .catch(
        (error) => console.log(error)
    )
}