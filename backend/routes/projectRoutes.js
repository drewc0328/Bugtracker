const express = require("express");

const projectController = require("../controllers/projectController");
const router = express.Router();

router.get("/getProjects", projectController.getProjects);
router.post("/getUsersProjects", projectController.getUsersProjects);
router.post("/createProject", projectController.createProject);
router.post("/addPerson", projectController.addPerson);
router.patch("/changeProjectName", projectController.changeProjectName);
router.delete("/removePerson", projectController.removePerson);
router.delete("/deleteProject", projectController.deleteProject);

module.exports = router;
