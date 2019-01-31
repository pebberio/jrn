import {setup} from "./jira-login";
import inquirer from "inquirer";
import prompts from "./prompts";
import helper from "./helper";
import promptTransition from "./prompt-transition";

module.exports = {
  start: function() {
    const jira = setup();
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
  }
};
