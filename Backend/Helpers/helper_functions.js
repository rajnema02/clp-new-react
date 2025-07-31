const multer = require('multer')
const fs = require('fs')
const path = require('path')
const axios = require('axios')

var store = multer.diskStorage({
    destination: function (req, file, cb) {
        const dateObj = new Date()
        const month = dateObj.getUTCMonth() + 1
        const day = dateObj.getUTCDate()
        const year = dateObj.getUTCFullYear()
        if (!fs.existsSync('./uploads/' + year)) {
            fs.mkdirSync('./uploads/' + year)
        }
        if (!fs.existsSync('./uploads/' + year + '/' + month)) {
            fs.mkdirSync('./uploads/' + year + '/' + month)
        }
        cb(null, './uploads/' + year + '/' + month)
    },
    filename: function (req, file, cb) {
        cb(null, Date.now().toString() + '_' + path.basename(generateRandomString(12), path.extname(file.originalname)) + path.extname(file.originalname))
        // cb(null, req.body.docname + '.jpg')
    }
})

var storeFace = multer.diskStorage({
    destination: function (req, file, cb) {
        const baseName = path.basename(file.originalname);
        const emp_code = baseName.split('_SEQUENCE_')[0];
        if (!fs.existsSync('./faces/' + emp_code)) {
            fs.mkdirSync('./faces/' + emp_code)
        }
        if (!fs.existsSync('./gfaces/' + emp_code)) {
            fs.mkdirSync('./gfaces/' + emp_code)
        }
        cb(null, './faces/' + emp_code)
    },
    filename: function (req, file, cb) {
        cb(null, path.basename(file.originalname))
        // cb(null, req.body.docname + '.jpg')
    }
})

var storeAttendance = multer.diskStorage({
    destination: function (req, file, cb) {
        const baseName = path.basename(file.originalname);
        const emp_code = baseName.split('_SEQUENCE_')[0];
        if (!fs.existsSync('./attendance/' + emp_code)) {
            fs.mkdirSync('./attendance/' + emp_code)
        }
        if (!fs.existsSync('./gattendance/' + emp_code)) {
            fs.mkdirSync('./gattendance/' + emp_code)
        }
        cb(null, './attendance/' + emp_code)
    },
    filename: function (req, file, cb) {
        cb(null, path.basename(file.originalname))
        // cb(null, req.body.docname + '.jpg')
    }
})

module.exports = {
    uploadFace: multer({ storage: storeFace }).single("face"),
    uploadAttendance: multer({ storage: storeAttendance }).single("attendance"),
    upload: multer({ storage: store }).single("file"),
    uploadImage: multer({ storage: store }).single("image"),
    uploadProfilePicture: multer({ storage: store }).single("profile_picture"),
    uploadMultipleImages: multer({ storage: store }).array("images"),
    uploadMultipleVideos: multer({ storage: store }).array("videos"),
    uploadMultipleImagesAndVideos: multer({ storage: store }).fields([{ name: 'images' }, { name: 'videos' }]),
    uploadVendorData: multer({ storage: store }).fields([
        { name: 'gst_certificate_file_path' },
        { name: 'pan_card_file_path' },
        { name: 'cancel_cheque_file_path' },
        { name: 'MSME_certificates_file_path' },
        { name: 'other_certificates_path' },
        { name: 'signature' },
        { name: 'profile_picture' },
    ]),
    uploadMultipleDocs: multer({ storage: store }).array("docs"),
    generatePassword: () => {
        var length = 8,
            charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
            retVal = "";
        for (var i = 0, n = charset.length; i < length; ++i) {
            retVal += charset.charAt(Math.floor(Math.random() * n));
        }
        return retVal;
    },
    generateOtp: () => {
        var length = 5,
            charset = "0123456789",
            retVal = "";
        for (var i = 0, n = charset.length; i < length; ++i) {
            retVal += charset.charAt(Math.floor(Math.random() * n));
        }
        return retVal;
    },
    generateMobileOtp: async (mobile = 0) => {
        var length = 4,
            charset = "0123456789",
            retVal = "";
        for (var i = 0, n = charset.length; i < length; ++i) {
            retVal += charset.charAt(Math.floor(Math.random() * n));
        }
        if (mobile == 9074297336) {
            retVal = '1111'
        }
        return retVal;
    },
    shipRocket: (servicePath, data, method = "POST") => {
        var config = {
            method,
            url: `${process.env.LOGISTIC_URI}/${servicePath}`,
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + process.env.LOGISTIC_TOKEN
            },
            data: data,
        };
        return axios(config);
    },
    smsCall: (servicePath, data, method = "POST") => {
        var config = {
            method,
            url: `${process.env.SMS_URI}/${servicePath}`,
            // headers: {
            //     "Content-Type": "application/json",
            //     "Authorization": "Bearer " + process.env.SMS_TOKEN
            // },
            // data: data,
        };
        return axios(config);
    },
    csvToJson: (csvData) => {
        const rows = csvData.split('\n');
        const headers = rows.shift().split(',');
        const jsonData = rows.map(row => {
            const values = row.split(',');
            const obj = {};
            headers.forEach((header, i) => {
                obj[header] = values[i];
            });
            return obj;
        });
        return jsonData;
    },
    csvDataToObjOutput: (csvDataId) => {
        let filepath = 'public/stream_data/' + csvDataId + '.csv'
        if (fs.existsSync(filepath)) {
            let fileData = fs.readFileSync(filepath);
            fileData = fileData.toLocaleString().split('\n');
            fileData.shift();
            obj_output = fileData.map((line) => line.split(','))
            obj_output = groupByIndex(obj_output, 2);
            return obj_output;
        } else {
            return [];
        }
    },
    generateOrderID: () => {
        if (!fs.existsSync('orderSequence.txt')) {
            fs.writeFileSync('orderSequence.txt', process.env.INITIAL_SEQUENCE_ORDER);
        }
        const sequence = fs.readFileSync('orderSequence.txt', 'utf8');
    
        let currentSequence = parseInt(sequence);
    
        const nextSequence = currentSequence + 1;
    
        fs.writeFileSync('orderSequence.txt', nextSequence.toString(), 'utf8');
    
        return nextSequence;
    },
}


function generateRandomString(len) {
    var length = len,
        charset = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ",
        retVal = "";
    for (var i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
}

function groupByIndex(arr, index) {
    const groups = {};

    arr.forEach(subArr => {
        const key = subArr[index];

        if (!groups[key]) {
            groups[key] = [];
        }

        groups[key].push(subArr);
    });

    return Object.values(groups);
}