const pool = require('../middlewares/config-pool');

exports.chatsTable = () => {
  pool.query(`
    CREATE TABLE IF NOT EXISTS
    lu_chats(
        chat_id UUID,
        chat TEXT NOT NULL,
        author_id UUID NOT NULL,
        created_on TIMESTAMP DEFAULT NOW(),
        PRIMARY KEY(chat_id)
    )
    `)
    .catch(
      (error) => {
        console.log(error);
      },
    );
};
