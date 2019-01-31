import conf from "./conf";
import {JiraApi} from "jira";

let jira;

module.exports = {
  setup: function() {
    if(!jira) {
      jira = new JiraApi(
        conf.jira('protocol'),
        conf.jira('host'),
        conf.jira('port'),
        conf.jira('username'),
        conf.jira('password'),
        '2',
        true,
        false)
    }
    return jira;
  }
};
