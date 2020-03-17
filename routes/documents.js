const express = require('express');

const docsCtrl = require('../controllers/documents');
const router = express.Router();
const upload = require('../middlewares/config-multer').upload;
const auth = require('../middlewares/auth').auth;

router.post('/',auth, upload, docsCtrl.uploadDoc);
router.delete('/:docId', docsCtrl.deleteDoc);
router.get('/', docsCtrl.getDocs);
router.get('/:docId', docsCtrl.getDoc);

module.exports = router;
