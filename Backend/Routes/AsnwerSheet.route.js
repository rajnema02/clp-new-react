const router = require("express").Router();
const Controller = require("../Controllers/AnswerSheet.controller");
const { verifyAccessToken } = require("../Helpers/jwt_helper");

router.post("/", verifyAccessToken, Controller.updatedAnswer);
router.post("/generateResult", verifyAccessToken, Controller.generateResult);
router.post("/showAttendenceList", verifyAccessToken, Controller.showAttendenceList);
router.post(
  "/showResultsToAdmin",
  verifyAccessToken,
  Controller.showResultsToAdmin
);
router.post(
  "/showPassedResultsToAdmin",
  verifyAccessToken,
  Controller.showPassedResultsToAdmin
);
router.post(
  "/showFailedResultsToAdmin",
  verifyAccessToken,
  Controller.showFailedResultsToAdmin
);
router.get(
  "/getTotalCount",
  verifyAccessToken,
  Controller.getTotalCount
);
router.get(
  "/testGrades",
  verifyAccessToken,
  Controller.testGrades
);
router.get(
  "/checkIfAlreadyProcessed",
  verifyAccessToken,
  Controller.checkIfAlreadyProcessed
);


module.exports = router;
