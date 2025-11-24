const { Router } = require('express');
const {
    getAllAutobuses,
    getAutobusesById,
    createAutobuses,
    editAutobuses,
    deleteAutobuses
} = require('../controllers/autobuses.controller');
const upload = require('../libs/multer');
const processImage = require('../middlewares/processImage');

const router = Router();

router.get('/', getAllAutobuses);
router.get('/:id', getAutobusesById);
router.post('/', upload.single('imagen'), processImage, createAutobuses);
router.put('/:id', upload.single('imagen'), processImage, editAutobuses);
router.delete('/:id', deleteAutobuses);

module.exports = router;
