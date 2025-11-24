const { Router } = require('express');
const { register, login, updateUser } = require('../controllers/auth.controller');
const validateToken = require('../middlewares/validateToken');

const upload = require('../libs/multer');

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.put('/users/:id', validateToken, upload.single('imagen'), updateUser);

module.exports = router;
