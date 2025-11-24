const { Router } = require('express');
const {
    getAllAutobuses,
    getAutobusesById,
    createAutobuses,
    editAutobuses,
    deleteAutobuses
} = require('../controllers/autobuses.controller');
const upload = require('../libs/multer');


const router = Router();

router.get('/', getAllAutobuses);
router.get('/:id', getAutobusesById);
router.post('/', upload.single('imagen'), createAutobuses);
router.put('/:id', upload.single('imagen'), editAutobuses);
router.delete('/:id', deleteAutobuses);

module.exports = router;
