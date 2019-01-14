'use strict';

process.chdir(__dirname);
var inquirer = require("inquirer");
var helper = require("./helper");
var promptTransition = require("./prompt-transition");
var jira = require('./jira-login').setup();
var prompts = require('./prompts');

var prompt = inquirer.createPromptModule();

prompt(prompts).then(answers => {
  jira.addNewIssue(
    helper.buildIssueOf(answers),
    function (error, response) {
      if (error === null) {
        helper.printNewIssue(response);
        promptTransition.runWith(response.key);
      } else {
        helper.abortOnErrorOf(error, response);
      }
    });
});
