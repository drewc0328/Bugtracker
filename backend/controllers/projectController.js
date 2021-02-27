const HttpError = require("../models/http-error");

const User = require("../models/User");
const Project = require("../models/Project");

const getProjects = async (req, res, next) => {
  let projects;

  try {
    projects = await Project.find({});
  } catch (err) {
    const error = new HttpError("Error finding projects", 422);
    return next(error);
  }

  res.status(201).json({ projects: projects });
};

const getUsersProjects = async (req, res, next) => {
  const { id } = req.body;

  let user;

  try {
    user = await User.findById(id);
  } catch (err) {
    const error = new HttpError("Error finding the user by ID", 422);
    return next(error);
  }

  if (!user) {
    const error = new HttpError("User doesn't exist", 500);
    return next(error);
  }

  let projects = user.projects;
  let projectList = [];

  if (projects.length > 0) {
    let foundProject;
    for (const project of projects) {
      try {
        foundProject = await Project.findById(project);
        projectList.push(foundProject);
      } catch (err) {
        const error = new HttpError("Error finding projects", 422);
        return next(error);
      }
    }
  }

  res.status(201).json({ projects: projectList });
};

const createProject = async (req, res, next) => {
  const { uid, name } = req.body;

  let existingUser;

  try {
    existingUser = await User.findById(uid);
  } catch (err) {
    const error = new HttpError("Error finding the user", 422);
    return next(error);
  }

  if (!existingUser) {
    const error = new HttpError(
      "This project is being created without a user",
      422
    );
    return next(error);
  }

  let project = new Project({
    name,
    people: [{ id: uid, admin: true }],
    issues: [],
  });

  try {
    await project.save();
  } catch (err) {
    const error = new HttpError("Error saving the project", 500);
    return next(error);
  }

  existingUser.projects = [...existingUser.projects, project._id];

  try {
    await existingUser.save();
  } catch (err) {
    const error = new HttpError("Error saving the project to the user", 500);
    return next(error);
  }

  res.status(201).json({ project: project });
};

const deleteProject = async (req, res, next) => {
  const { uid, pid } = req.body;

  let existingUser;

  try {
    existingUser = await User.findById(uid);
  } catch (err) {
    const error = new HttpError("Error finding the user", 422);
    return next(error);
  }

  if (!existingUser) {
    const error = new HttpError(
      "This project is being created without a user",
      422
    );
    return next(error);
  }

  try {
    existingProject = await Project.findById(pid);
  } catch (err) {
    const error = new HttpError("Error finding the service", 422);
    return next(error);
  }

  let isAdmin = false;

  existingProject.people.forEach((people) => {
    if (people.id === uid) {
      isAdmin = people.admin;
    }
  });

  if (!isAdmin) {
    const error = new HttpError(
      "You don't have admin rights to delete the project",
      422
    );
    return next(error);
  }

  // Search through each user and delete the project that has just been deleted

  let userList = existingProject.people;
  console.log("userList: ", userList);
  let foundUser;
  userList.forEach(async (user) => {
    try {
      foundUser = await User.findById(user.id);
      console.log("foundUser before: ", foundUser);
      foundUser.projects = foundUser.projects.filter((project) => {
        return project !== pid;
      });
      console.log("foundUser after: ", foundUser);
      await foundUser.save();
    } catch (err) {
      const error = new HttpError("Error deleting project from user's", 500);
      return next(error);
    }
  });

  try {
    await Project.findByIdAndDelete(pid);
  } catch (err) {
    const error = new HttpError("Error finding the service", 422);
    return next(error);
  }

  res.status(201).json({ message: "Project has been deleted" });
};

const changeProjectName = async (req, res, next) => {
  const { uid, pid, name } = req.body;

  let existingUser;

  try {
    existingUser = await User.findById(uid);
  } catch (err) {
    const error = new HttpError("Error finding the user", 422);
    return next(error);
  }

  if (!existingUser) {
    const error = new HttpError(
      "This project is being created without a user",
      422
    );
    return next(error);
  }

  try {
    existingProject = await Project.findById(pid);
  } catch (err) {
    const error = new HttpError("Error finding the service", 422);
    return next(error);
  }

  let isAdmin = false;

  existingProject.people.forEach((people) => {
    if (people.id === uid) {
      isAdmin = people.admin;
    }
  });

  if (!isAdmin) {
    const error = new HttpError(
      "You don't have admin rights to change the project name",
      422
    );
    return next(error);
  }

  existingProject.name = name;

  try {
    await existingProject.save();
  } catch (err) {
    const error = new HttpError("Error saving the project", 500);
    return next(error);
  }

  res.status(201).json({ project: existingProject });
};

const addPerson = async (req, res, next) => {
  const { sourceID, addedID, pid } = req.body;

  let existingUser;

  try {
    existingUser = await User.findById(sourceID);
  } catch (err) {
    const error = new HttpError("Error finding the user", 422);
    return next(error);
  }

  if (!existingUser) {
    const error = new HttpError(
      "This project is being created without a user",
      422
    );
    return next(error);
  }

  let addedUser;
  try {
    addedUser = await User.findById(addedID);
  } catch (err) {
    const error = new HttpError("Error finding added user", 500);
    return next(error);
  }

  if (!addedUser) {
    const error = new HttpError("The user being added doesn't exist", 422);
    return next(error);
  }

  try {
    existingProject = await Project.findById(pid);
  } catch (err) {
    const error = new HttpError("Error finding the service", 422);
    return next(error);
  }

  let isAdmin = false;

  existingProject.people.forEach((people) => {
    if (people.id === sourceID) {
      isAdmin = people.admin;
    }
  });

  if (!isAdmin) {
    const error = new HttpError(
      "You don't have admin rights to add a member",
      422
    );
    return next(error);
  }

  // Check if the added user isn't already on the project
  existingProject.people.forEach((people) => {
    if (people.id === addedID) {
      const error = new HttpError(
        "The added user is already in the project",
        500
      );
      return next(error);
    }
  });

  existingProject.people = [
    ...existingProject.people,
    { id: addedID, admin: false },
  ];

  try {
    await existingProject.save();
  } catch (err) {
    const error = new HttpError("Error saving the project", 500);
    return next(error);
  }

  addedUser.projects = [...addedUser.projects, pid];

  try {
    await addedUser.save();
  } catch (err) {
    const error = new HttpError("Error saving the project to the user", 500);
    return next(error);
  }

  res.status(201).json({ project: existingProject });
};

const removePerson = async (req, res, next) => {
  const { sourceID, removedID, pid } = req.body;

  let existingUser;

  try {
    existingUser = await User.findById(sourceID);
  } catch (err) {
    const error = new HttpError("Error finding the user", 422);
    return next(error);
  }

  if (!existingUser) {
    const error = new HttpError(
      "This project is being created without a user",
      422
    );
    return next(error);
  }

  try {
    existingProject = await Project.findById(pid);
  } catch (err) {
    const error = new HttpError("Error finding the service", 422);
    return next(error);
  }

  let isAdmin = false;

  console.log("ExistingProject: ", existingProject);

  existingProject.people.forEach((people) => {
    if (people.id === sourceID) {
      isAdmin = people.admin;
    }
  });

  if (!isAdmin) {
    const error = new HttpError(
      "You don't have admin rights to remove a member",
      422
    );
    return next(error);
  }

  existingProject.people = existingProject.people.filter((people) => {
    return people.id !== removedID;
  });

  try {
    await existingProject.save();
  } catch (err) {
    const error = new HttpError("Error saving the project", 500);
    return next(error);
  }

  let removedUser;
  try {
    removedUser = await User.findById(removedID);
  } catch (err) {
    const error = new HttpError("Error finding the removed user", 500);
    return next(error);
  }

  removedUser.projects = removedUser.projects.filter((project) => {
    return project !== pid;
  });

  try {
    await removedUser.save();
  } catch (err) {
    const error = new HttpError("Error saving the removed user", 500);
    return next(error);
  }

  res.status(201).json({ project: existingProject });
};

exports.changeProjectName = changeProjectName;
exports.getProjects = getProjects;
exports.getUsersProjects = getUsersProjects;
exports.createProject = createProject;
exports.deleteProject = deleteProject;
exports.addPerson = addPerson;
exports.removePerson = removePerson;
