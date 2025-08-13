const router = require('express').Router();
const Controller = require('../Controllers/Course.controller');
const { verifyAccessToken } = require('../Helpers/jwt_helper');
const {upload} = require('../Helpers/Upload')

// CREATE
router.post("/", upload.single("course_content"), Controller.createCourse);


// COUNT
router.get('/count', verifyAccessToken, Controller.count);

// SPECIFIC FILTERS FIRST
router.get('/title/:title', verifyAccessToken, Controller.getByTitle);
router.get('/slug/:slug', verifyAccessToken, Controller.getBySlug);

// LIST ALL
router.get('/', verifyAccessToken, Controller.list);

// GET BY ID
router.get('/:id', verifyAccessToken, Controller.get);

// UPDATE
router.put('/:id', verifyAccessToken, Controller.update);
router.put('/title/:title', verifyAccessToken, Controller.updateByTitle);

// DELETE
router.delete('/:id', verifyAccessToken, Controller.deleteCourse);

// RESTORE
router.put('/:id/restore', verifyAccessToken, Controller.restore);

module.exports = router;
