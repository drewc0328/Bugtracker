const express = require("express");
const issueController = require("../controllers/issueController");

const router = express.Router();

router.post("/createIssue", issueController.createIssue);
router.post("/getProjectIssues", issueController.getProjectIssues);
router.post("/getUserIssues", issueController.getUserIssues);
router.patch("/editIssues", issueController.editIssues);
router.delete("/deleteIssue", issueController.deleteIssue);

module.exports = router;
