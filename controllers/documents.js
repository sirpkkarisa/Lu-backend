const pool = require('../middlewares/config-pool');
const uuid = require('uuid');
const fs = require('fs');

exports.uploadDoc = (req, res) => {
    if (req.file === undefined) {
        return res.status(400)
                .json({
                    status:'error',
                    error: 'Select A file'
                })
    }
    const docId = uuid.v4();
    const url = `${req.protocol}://${req.get('host')}`;
    const docUrl = `${url}/uploaded_docs/${req.file.filename}`;
    const { docTitle, authorId } = req.body;
    

    if(docUrl === undefined || docTitle === undefined || authorId === undefined) {
        return res.status(400)
            .json({
                status: 'error',
                error: 'All fields are required',
            })
    }
    pool.query('INSERT INTO documents VALUES($1, $2, $3, $4)', [docId, docTitle, docUrl, authorId])
        .then(
            () => {
                pool.query('SELECT * FROM documents')
                    .then(
                        ({rows}) => {
                            if(rows.length === 0) {
                                return res.status(400)
                                    .json({
                                        status: 'error',
                                        error: 'Something went wrong',
                                    })
                            }
                            return res.status(201)
                                    .json({
                                        status: 'succes',
                                        data: {
                                            message: 'Document has been uploaded successfully',
                                            document: rows,
                                        }
                                    })

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
}
exports.getDocs = (req, res) => {
    pool.query('SELECT * FROM documents')
        .then(
            ({rows}) => {
                if (rows.length === 0) {
                    return res.status(404)
                        .json({
                            status: 'error',
                            error: 'No documents'
                        })
                }
                return res.status(200)
                    .json({
                        status: 'success',
                        data: rows,
                    })
            }
        )
        .catch(
            (error) => {
                return res.status(500)
                .json({
                    status: 'error',
                    error: `${error}`
                })
            }
        )
}
exports.getDoc = (req, res) => {
    const { docId } = req.params;
    
    pool.query(`SELECT * FROM documents WHERE doc_id='${docId}'`)
        .then(
            ({rows}) => {
                if (rows.length === 0) {
                    return res.status(404)
                        .json({
                            status: 'error',
                            error: 'No document'
                        })
                }
                return res.status(200)
                    .json({
                        status: 'success',
                        data: rows,
                    })
            }
        )
        .catch(
            (error) => {
                return res.status(500)
                .json({
                    status: 'error',
                    error: `${error}`
                })
            }
        )
}
exports.deleteDoc = (req, res) => {
    const { docId } = req.params;
    const { authorId } = req.body;
    pool.query(`SELECT * FROM documents WHERE doc_id='${docId}' AND author_id='${authorId}'`)
        .then(
            ({rows}) => {
                if (rows.length === 0) {
                    return res.status(403)
                        .json({
                            status: 'error',
                            error: 'Unauthorized',
                        })
                }
                const filename = rows.map((data) => data.doc_url).toString().split('/uploaded_docs/')[1];
                fs.unlink(`uploaded_documents/${filename}`, () => {
                    pool.query(`DELETE FROM documents WHERE doc_id='${docId}'`)
                        .then(
                            () => {
                                res.status(200)
                                .json({
                                    status: 'success',
                                    data: {
                                        message: 'Document successfully deleted'
                                    }
                                })
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
                })
            }
        )
}