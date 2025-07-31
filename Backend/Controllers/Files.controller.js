var xlsx = require('node-xlsx')
// const debug = require('debug')('rekkoz:file')
const { upload, uploadAttendance, uploadFace } = require('./../Helpers/helper_functions')
const path = require('path')
const fs = require('fs')
const multer = require('multer');

// var store = multer.diskStorage({

//     destination: function (req, file, cb) {
//         if (!fs.existsSync('./uploads/' + year)) {
//             fs.mkdirSync('./uploads/' + year)
//         }
//         if (!fs.existsSync('./uploads/' + year + '/' + month)) {
//             fs.mkdirSync('./uploads/' + year + '/' + month)
//         }
//         cb(null, './uploads/' + year + '/' + month)
//     },
//     filename: function (req, file, cb) {
//         cb(null, Date.now().toString() + path.extname(file.originalname))
//         // cb(null, req.body.docname + '.jpg')
//     }
// })

// var upload = multer({ storage: store }).single("file")

// var upload2 = multer({ storage: store }).single("upload")

// const S3 = require('../services/file-upload')

// const uploadPapers3 = S3.uploadPapers3.single('file')


module.exports = {


    upload: (req, res) => {
        upload(req, res, function (err) {
            if (err) {
                return res.status(501).json({ error: err })
            }
        return res.json({ msg: "Uploaded Successfully", file: req.file })
        })
    },
    

    uploadS3File: (req, res) => {
        uploadPapers3(req, res, async (err, data) => {
            if (err) {
                return res.status(501).json({ error: err })
            } else {
                return res.json({ msg: "Uploaded Successfully", filepath: req.file ? req.file.location : '' })
            }
        });
    },

    uploadCkeditor: (req, res) => {
        upload2(req, res, function (err) {
            if (err) {
                return res.status(501).json({ error: err })
            }
            return res.json({ msg: "Uploaded Successfully", file: req.file, "fileName": req.file.filename, uploaded: 1, url: "http://localhost:3400\/file\/download\/" + req.file.path })
        })
    },
    face_upload: (req, res) => {
        uploadFace(req, res, function (err) {
            if (err) {
                return res.status(501).json({ error: err })
            }
            return res.json({ msg: "Uploaded Successfully", file: req.file })
        })
    },
    attendance_upload: (req, res) => {
        uploadAttendance(req, res, function (err) {
            if (err) {
                return res.status(501).json({ error: err })
            }
            const dirPath = './gattendance/' + req.body.unique_key;
            let attent = '';
            if (fs.existsSync(dirPath) && fs.existsSync(dirPath + '/attent.txt')) {
                const fileData = fs.readFileSync(dirPath + '/attent.txt');
                attent = fileData.toString();
            }
            return res.json({ msg: "Uploaded Successfully", file: req.file, attent })
        })
    },

    download: (req, res) => {
        if (req.params.folder1 && req.params.folder2 && req.params.folder3) {
            filepath = path.join(__dirname, "/../") + req.params.folder1 + '/' + req.params.folder2 + '/' + req.params.folder3 + '/' + req.params.filename
            console.log("FilePath???", filepath);
            
        } else {
            filepath = path.join(__dirname, "/../") + (req.params.filename).split('%2F').join('/')
        }
        defaultFilePath = path.join(__dirname, "/../public/uploads") + "/no-image.png"
        if (fs.existsSync(filepath)) {
            res.sendFile(filepath)
        } else {
            res.sendFile(defaultFilePath)
        }
    },

    folderDownload: (req, res) => {
        filepath = path.join(__dirname, "/../uploads") + "/" + req.params.folder + "/" + req.params.filename
        defaultfilepath = path.join(__dirname, "/../public/uploads") + "/no-image.png"
        if (fs.existsSync(filepath)) {
            res.sendFile(filepath)
        } else {
            res.sendFile(defaultfilepath)
        }
    },
    faceDownload: (req, res) => {
        filepath = path.join(__dirname, "/../faces") + "/" + req.params.filename.split("_SEQUENCE_")[0] + "/" + req.params.filename
        defaultfilepath = path.join(__dirname, "/../public/uploads") + "/no-image.png"
        if (fs.existsSync(filepath)) {
            res.sendFile(filepath)
        } else {
            res.sendFile(defaultfilepath)
        }
    },
    attendanceDownload: (req, res) => {
        filepath = path.join(__dirname, "/../attendance_db") + "/" + req.params.filename.split("_SEQUENCE_")[0] + "/" + req.params.filename
        defaultfilepath = path.join(__dirname, "/../public/uploads") + "/no-image.png"
        if (fs.existsSync(filepath)) {
            res.sendFile(filepath)
        } else {
            res.sendFile(defaultfilepath)
        }
    },
}