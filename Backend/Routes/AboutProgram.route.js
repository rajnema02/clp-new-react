const router = require('express').Router()
const Controller = require('../Controllers/AboutProgram.controller')
const { verifyAccessToken } = require('../Helpers/jwt_helper')
const {uploadFile }  = require("../Helpers/Upload")

const upload = uploadFile("about-program", [".pdf", ".doc", ".docx", ".txt"]);

// Create a new About Program entry with file upload
router.post("/", upload.single("file"), Controller.create);


router.get('/count', verifyAccessToken, Controller.count)

router.get('/:id', verifyAccessToken, Controller.get)

router.get('/title/:title', verifyAccessToken, Controller.getByTitle)

router.get('/slug/:slug', verifyAccessToken, Controller.getBySlug)

router.get('/', verifyAccessToken, Controller.list)

router.put('/:id', verifyAccessToken, Controller.update)

router.put('/title/:title', verifyAccessToken, Controller.updateByTitle)

router.delete('/:id', verifyAccessToken, Controller.delete)

router.put('/:id/restore', verifyAccessToken, Controller.restore)

module.exports = router
