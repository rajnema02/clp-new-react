const router = require("express").Router();
const Controller = require("../Controllers/Message.controller");
const { verifyAccessToken } = require("../Helpers/jwt_helper");
const { uploadFile } = require("../Helpers/Upload");

// ✅ Create multer instance specifically for "messages" folder
const messageUpload = uploadFile("messages", [
  ".pdf", ".doc", ".docx", ".txt", ".png", ".jpg", ".jpeg"
]);

// ✅ Create Message (with file upload + authentication)
router.post(
  "/",
  verifyAccessToken,                  // ✅ require user (req.user will be set)
  messageUpload.single("messageFile"), // ✅ multer parses "messageFile"
  Controller.create                    // ✅ now data goes to DB
);

// ✅ Update message
router.post("/:id", verifyAccessToken, Controller.update);

// ✅ Other routes
router.get("/common", Controller.getCommonMessages);
router.get("/studentMessagesByAdmin", verifyAccessToken, Controller.getStudentMessagesByAdmin);
router.get("/studentMessages", verifyAccessToken, Controller.getStudentMessages);
router.get("/disableMessage/:id", verifyAccessToken, Controller.disableMessage);
router.get("/:id", verifyAccessToken, Controller.get);
router.get("/", verifyAccessToken, Controller.list);

module.exports = router;
