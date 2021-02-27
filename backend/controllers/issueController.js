const User = require("../models/User");
const Project = require("../models/Project");
const Issue = require("../models/Issue");
const HttpError = require("../models/http-error");

const createIssue = async (req, res, next) => {
  const {
    uid,
    pid,
    title,
    description,
    assigned_to,
    status,
    priority,
  } = req.body;

  let existingUser;

  try {
    existingUser = await User.findById(uid);
  } catch (err) {
    const error = new HttpError("Error finding the user");
    return next(error);
  }

  if (!existingUser) {
    const error = new HttpError(
      "Error.. issue is being created by a non-existent user"
    );
    return next(error);
  }

  let existingProject;

  try {
    existingProject = await Project.findById(pid);
  } catch (err) {
    const error = new HttpError("Error finding the project");
    return next(error);
  }

  if (!existingProject) {
    const error = new HttpError(
      "Error.. issue is being added to a non-existent project"
    );
    return next(error);
  }

  let issue = new Issue({
    title,
    description,
    created_by: uid,
    created_at: new Date(),
    assigned_to,
    status,
    priority,
  });

  try {
    await issue.save();
  } catch (err) {
    const error = new HttpError("Error.. Couldn't save issue to DB");
    return next(error);
  }

  existingProject.issues = [...existingProject.issues, issue._id];

  try {
    await existingProject.save();
  } catch (err) {
    const error = new HttpError("Error.. Couldn't save issue to the project");
    return next(error);
  }

  res.status(201).json({ project: existingProject });
};

const deleteIssue = async (req, res, next) => {
  // delete issue from db and delete issue from project
  const { id, pid } = req.body;

  let project;

  try {
    project = await Project.findById(pid);
  } catch (err) {
    const error = new HttpError("Error finding the project", 500);
    return next(error);
  }

  if (!project) {
    const error = new HttpError("Error.. the project doesn't exist", 500);
    return next(error);
  }

  project.issues = project.issues.forEach((issue) => {
    return issue !== id;
  });

  try {
    await project.save();
  } catch (err) {
    const error = new HttpError("Error saving the project", 500);
    return next(error);
  }

  let issue;

  try {
    issue = await Issue.findByIdAndDelete(id);
  } catch (err) {
    const error = new HttpError("Error finding the issue", 500);
    return next(error);
  }

  if (!issue) {
    const error = new HttpError("Error.. the issue doesn't exist", 500);
    return next(error);
  }

  res.status(201).json({ project: project });
};

const getProjectIssues = async (req, res, next) => {
  const { pid } = req.body;

  let issues;
  try {
    issues = await getProjectIssuesFunction(pid);
  } catch (err) {
    const error = new HttpError("Error finding the issues", 500);
    return next(error);
  }

  let issueList = [];

  if (issues.length > 0) {
    let foundIssue;
    for (let issue of issues) {
      try {
        foundIssue = await getIssuesFunction(issue);
        issueList.push(foundIssue);
      } catch (err) {
        const error = new HttpError("Error finding the issues", 500);
        return next(error);
      }
    }
  }

  res.status(201).json({ issues: issueList });
};

const getProjectIssuesFunction = async (pid) => {
  let project;

  try {
    project = await Project.findById(pid);
  } catch (err) {
    const error = new HttpError("Error finding the project", 500);
    return next(error);
  }

  if (!project) {
    const error = new HttpError("Error.. the project doesn't exist", 500);
    return next(error);
  }

  return project.issues;
};

const getIssuesFunction = async (id) => {
  let issue;

  try {
    issue = await Issue.findById(id);
  } catch (err) {
    const error = new HttpError("Error finding the issue", 500);
    return next(error);
  }

  if (!issue) {
    const error = new HttpError("Error.. the issue doesn't exist", 500);
    return next(error);
  }

  return issue;
};

const getUserIssues = async (req, res, next) => {
  const { id } = req.body;

  let existingUser;

  try {
    existingUser = await User.findById(id);
  } catch (err) {
    const error = new HttpError("Error finding the user", 500);
    return next(error);
  }

  let projects = existingUser.projects;

  console.log(projects);

  let issueList = [];

  if (projects.length === 0) {
    // If the user isn't a part of any projects
    console.log("0");
  } else if (projects.length === 1) {
    // If the user is in only one project
    let projectIssues;
    try {
      // Get the issues in the project
      projectIssues = await getProjectIssuesFunction(projects);
    } catch (err) {
      const error = new HttpError("Error finding the project issues", 500);
      return next(error);
    }
    // If there are issues
    if (projectIssues.length > 0) {
      for (let issue of projectIssues) {
        const content = await getIssuesFunction(issue);
        issueList.push(content);
      }
    }
  } else {
    // If the user is in more than 1 project
    // Get each issue for each project
    for (let project of projects) {
      let projectIssues;
      try {
        projectIssues = await getProjectIssuesFunction(project);
        if (projectIssues.length > 0) {
          for (let issue of projectIssues) {
            const content = await getIssuesFunction(issue);
            issueList.push(content);
          }
        }
      } catch (err) {
        const error = new HttpError("Error finding the project", 500);
        return next(error);
      }
    }
  }

  res.status(201).json({ projects: issueList });
};

const editIssues = async (req, res, next) => {
  const { id, title, description, assigned_to, status, priority } = req.body;

  let existingIssue;

  try {
    existingIssue = await Issue.findByIdAndUpdate(id, {
      title,
      description,
      assigned_to,
      status,
      priority,
    });
  } catch (err) {
    const error = new HttpError("Error updating the issue", 500);
    return next(error);
  }
  res.status(201).json({ issue: existingIssue });
};

exports.createIssue = createIssue;
exports.deleteIssue = deleteIssue;
exports.getProjectIssues = getProjectIssues;
exports.getUserIssues = getUserIssues;
exports.editIssues = editIssues;
