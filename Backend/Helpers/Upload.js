const multer = require("multer");
const path = require("path");
const fs = require("fs");

/**
 * Universal upload function
 * @param {string} folderName - Subfolder name inside /uploads
 * @param {Array} allowedTypes - Allowed file extensions (e.g., [".pdf", ".docx"])
 */
function uploadFile(folderName, allowedTypes = [".pdf", ".doc", ".docx", ".txt"]) {
    // Create upload directory if it doesn't exist
    const uploadDir = path.join(__dirname, `../uploads/${folderName}`);
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Multer storage config
    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
            cb(null, uniqueSuffix + path.extname(file.originalname));
        }
    });

    // File filter
    const fileFilter = (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowedTypes.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error(`Invalid file type. Allowed: ${allowedTypes.join(", ")}`), false);
        }
    };

    return multer({ storage, fileFilter });
}

module.exports = { uploadFile };
