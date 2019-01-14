var conf = require("./conf");
var chalk = require('chalk');

module.exports = {
  line: function () {
    console.log(chalk.blue("-------------------------------------"));
  },
  exit: function (msg) {
    console.log(msg);
    process.exit(1);
  },
  verifyLengthOf: function (data, key) {
    if (data.length === 0) {
      this.exit("No " + key + " found");
    }
    return data;
  },
  abortOnErrorOf: function (error, response) {
    if (error || response.statusCode !== 200) {
      this.exit(error + ': ' + response);
    }
  },
  renderProjects: function (projects) {
    return this.verifyLengthOf(
      projects.filter(project => conf.jira('projects').indexOf(project.key) >= 0)
        .map(project => project.key),
      'Project');
  },
  renderIssueTypes: function (issueTypes) {
    return this.verifyLengthOf(
      issueTypes.filter(issueType => conf.jira('issueTypes').indexOf(issueType.id) >= 0)
        .map(issueType => issueType.name),
      'Type');
  },
  renderSprints: function(response, BACKLOG_KEY) {
    var ret = [];
    if (response.body !== null) {
      var rapidViews = response.body.values;
      ret = rapidViews.map(sprint => sprint.id + ": " + sprint.name + " (" + sprint.state + ")");
    }
    // add an BACKLOG entry. The User can choose this, if adding a sprint is not wanted
    ret.push(BACKLOG_KEY);
    return ret;
  },
  buildIssueOf: function (answers) {
    var issue = {
      "fields": {
        "project":
          {
            "key": answers.project
          },
        "summary": answers.title,
        "description": answers.description,
        "issuetype": {
          "name": answers.issueType
        }
      }
    };
    if (answers.sprint !== "") {
      issue["fields"]["customfield_" + conf.sprint('customFieldId')] = parseInt(answers.sprint);
    }
    return issue;
  },
  printNewIssue: function(issue) {
    this.line();
    console.log(chalk.green("Issue has been created"));
    this.line();
    console.log("KEY: " + issue.key);
    console.log("URL: " + chalk.green(conf.jira('protocol') + "://" + conf.jira('host') + ":" + conf.jira('port') + "/browse/" + issue.key) + " (cmd+click)");
    this.line();
  }
};

