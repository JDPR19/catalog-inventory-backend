const { Router } = require('express');
const {
    getALLRepuestos,
    getRepuestosById,
    createRepuestos,
    editRepuestos,
    deleteRepuestos
} = require('../controllers/repuestos.controller');
const upload = require('../libs/multer');


const router = Router();

router.get('/', getALLRepuestos);
router.get('/:id', getRepuestosById);
router.post('/', upload.single('imagen'), createRepuestos);
router.put('/:id', upload.single('imagen'), editRepuestos);
router.delete('/:id', deleteRepuestos);

module.exports = router;
