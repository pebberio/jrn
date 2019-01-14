var helper = require("./helper");
var chalk = require('chalk');
var inquirer = require("inquirer");

let NO_THANKS_KEY = "NO THANKS";

function renderTransitions(transitions, NO_THANKS_KEY) {
  var ret = transitions.map(transition => transition.id + ': ' + transition.name);
  ret.unshift(NO_THANKS_KEY);
  return ret;
}

module.exports = {
  runWith: function (jira, issueKey) {
    jira.listTransitions(issueKey, function (error, res) {
      let transitions = renderTransitions(res, NO_THANKS_KEY);
      if (transitions.length >= 1) {
        var prompts = [{
          type: 'list',
          name: 'transition',
          message: 'Do you want to execute a transition',
          choices: transitions,
          filter: function (value) {
            return value === NO_THANKS_KEY ? "" : value.split(':').shift();
          }
        }];

        let prompt = inquirer.createPromptModule();

        prompt(prompts).then(answers => {
          if (answers.transition) {
            jira.transitionIssue(issueKey, {"transition": {"id": answers.transition}}, function (error) {
              if (error) {
                helper.exit(error);
              }
              console.log(chalk.green('Transition successfully executed'));
            });
          }
        });
      }
    });
  }
};

