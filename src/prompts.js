var conf = require("./conf");
var resources = require("./resources");

module.exports = [{
  type: 'list',
  name: 'project',
  message: 'Choose a JIRA project',
  choices: resources.getProjects
}, {
  type: 'list',
  name: 'issueType',
  message: 'Choose an issue type',
  choices: resources.getIssueTypes
}, {
  name: 'title',
  message: 'Issue title',
  description: '',
  type: 'string',
  validate: function (value) {
    return (value !== "");
  }
}, {
  name: 'description_wanted',
  message: 'Do you want to add a description',
  type: 'confirm',
  default: false
}, {
  name: 'description',
  message: 'Issue description',
  description: '',
  type: 'editor',
  when: function (answers) {
    return answers.description_wanted;
  }
}, {
  type: 'list',
  name: 'sprint',
  message: 'Sprint',
  choices: resources.getSprints,
  filter: function (value) {
    return value === conf.BACKLOG_KEY ? "" : value.split(':').shift();
  }
}];

