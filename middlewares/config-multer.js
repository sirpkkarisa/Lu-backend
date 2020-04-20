const multer = require('multer');


const MIME_TYPES = {
    'application/pdf': 'pdf',
    'application/vnd.ms-powerpoint': 'ppt',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
    'application/vnd.ms-excel': 'xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
    'application/zip': 'zip',
    'application/x-7z-compressed': '7z',
    'application/vnd.rar': 'rar',
    'application/vnd.oasis.opendocument.text': 'odt',
    'application/vnd.oasis.opendocument.spreadsheet': 'ods',
    'application/vnd.oasis.opendocument.presentation': 'odp',
    'application/msword': 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx'
}
const storage = multer.diskStorage({
    destination: (req, res, callback) => {
        callback(null, 'uploaded_documents');
    },
    filename: (req, file, callback) => {
      let name = file.originalname.split(' ').join('_');
      name = name.split('.pdf')[0];
      const extension = MIME_TYPES[file.mimetype];
      callback(null, `${name + Date.now()}.${extension}`);
    },
  });
  exports.upload = multer({
    storage,
    limits: {
      fileSize: 1024 * 1024 * 50,
    },
  }).single('document');
  