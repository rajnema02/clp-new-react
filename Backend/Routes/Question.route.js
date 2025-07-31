const router = require('express').Router()
const Controller = require('../Controllers/Question.controller')
const { verifyAccessToken } = require('../Helpers/jwt_helper')


router.post('/uploadQuestions', verifyAccessToken, Controller.uploadQuestions);
router.post('/', verifyAccessToken, Controller.create);
router.get('/:id',verifyAccessToken,  Controller.get);
router.get('/',verifyAccessToken,  Controller.list);
router.put('/:id',verifyAccessToken,  Controller.update);
router.delete('/:id', verifyAccessToken, Controller.delete);



module.exports = router;