const router = require("express").Router();
const Controller = require("../Controllers/Message.controller");
const { verifyAccessToken } = require("../Helpers/jwt_helper");
const { uploadFile } = require("../Helpers/Upload");

// ✅ Create multer instance specifically for "messages" folder
const messageUpload = uploadFile("messages", [".pdf", ".doc", ".docx", ".txt", ".png", ".jpg", ".jpeg"]);

// ✅ Message file upload route
router.post(
  "/",
  messageUpload.single("messageFile"), // MUST match FormData key from frontend
  (req, res) => {
    console.log("Uploaded File:", req.file);
    console.log("Other Data:", req.body);
    res.json({ success: true, file: req.file, body: req.body });
  }
);

// Update message
router.post("/:id", verifyAccessToken, Controller.update);

// Other routes
router.get("/common", Controller.getCommonMessages);
router.get("/studentMessagesByAdmin", verifyAccessToken, Controller.getStudentMessagesByAdmin);
router.get("/studentMessages", verifyAccessToken, Controller.getStudentMessages);
router.get("/disableMessage/:id", verifyAccessToken, Controller.disableMessage);
router.get("/:id", verifyAccessToken, Controller.get);
router.get("/", verifyAccessToken, Controller.list);

module.exports = router;
