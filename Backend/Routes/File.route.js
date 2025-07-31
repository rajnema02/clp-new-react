const express = require("express");
const _router = express.Router();
const FileController = require('../Controllers/Files.controller')
const { verifyAccessToken } = require('../Helpers/jwt_helper')

_router.post("/upload",  FileController.upload);

_router.post("/upload-face", verifyAccessToken, FileController.face_upload);

_router.post("/upload-attendance", verifyAccessToken, FileController.attendance_upload);

_router.get("/face/download/:filename", FileController.faceDownload);

_router.get("/attendance/download/:filename", FileController.attendanceDownload);

_router.get("/download/:filename", FileController.download);

_router.get("/download/:folder1/:folder2/:folder3/:filename", FileController.download);

_router.get("/download/:folder/:filename", FileController.folderDownload);


module.exports = _router;
