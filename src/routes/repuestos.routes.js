const { Router } = require('express');
const {
    getALLRepuestos,
    getRepuestosById,
    createRepuestos,
    editRepuestos,
    deleteRepuestos
} = require('../controllers/repuestos.controller');
const upload = require('../libs/multer');
const processImage = require('../middlewares/processImage');

const router = Router();

router.get('/', getALLRepuestos);
router.get('/:id', getRepuestosById);
router.post('/', upload.single('imagen'), processImage, createRepuestos);
router.put('/:id', upload.single('imagen'), processImage, editRepuestos);
router.delete('/:id', deleteRepuestos);

module.exports = router;
