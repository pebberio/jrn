'use strict';

// settings
process.chdir(__dirname);
var config = require("config");
var JiraApi = require('jira').JiraApi;
var inquirer = require("inquirer");
var async = require("async");
var helper = require("./helper");
var promptTransition = require("./prompt-transition");

var jira = new JiraApi(
  config.get('Jira.protocol'),
  config.get('Jira.host'),
  config.get('Jira.port'),
  config.get('Jira.username'),
  config.get('Jira.password'),
  '2',
  true,
  false);

let BACKLOG_KEY = "BACKLOG";


/* START
 * *************************/

// start synchron functions
async.series({
  getProjects: function (callback) {
    jira.listProjects(function (error, res) {
      callback(null, helper.renderProjects(res));
    });
  },
  // get all visible issueTypes and filter by config
  getIssueTypes: function (callback) {
    jira.listIssueTypes(function (error, res) {
      callback(null, helper.renderIssueTypes(res));
    });
  },
  getSprints: function (callback) {
    var options = {
      rejectUnauthorized: jira.strictSSL,
      uri: jira.makeUri("/board/" + config.get('Sprint.rapidView') + "/sprint?state=" + config.get("Sprint.state"), "rest/agile/", "1.0"),
      method: 'GET',
      json: true
    };
    jira.doRequest(options, function (error, response) {
      helper.abortOnErrorOf(error, response);
      callback(null, helper.renderSprints(response, BACKLOG_KEY));
    });
  }
}, function (err, res) {
  var prompts = [{
    type: 'list',
    name: 'project',
    message: 'Choose a JIRA project',
    choices: res.getProjects
  }, {
    type: 'list',
    name: 'issueType',
    message: 'Choose a issue type',
    choices: res.getIssueTypes
  }, {
    name: 'title',
    message: 'Issue title',
    description: '',
    type: 'string',
    validate: function (value) {
      return (value !== "");
    }
  }, {
    name: 'description',
    message: 'Issue description',
    description: '',
    type: 'string'
  }, {
    type: 'list',
    name: 'sprint',
    message: 'Sprint',
    choices: res.getSprints,
    filter: function (value) {
      return value === BACKLOG_KEY ? "" : value.split(':').shift();
    }
  }];

  var prompt = inquirer.createPromptModule();

  prompt(prompts).then(answers => {
    var issue = helper.buildIssueOf(answers);

    // create issue in jira
    jira.addNewIssue(issue, function (err, res) {
      if (err === null) {
        helper.printNewIssue(res);
        promptTransition.runWith(jira, res.key);
      } else {
        helper.abortOnErrorOf(err, res);
      }
    });
  });
});

