var conf = require("./conf");
var JiraApi = require('jira').JiraApi;

module.exports = {
  setup: new JiraApi(
    conf.jira('protocol'),
    conf.jira('host'),
    conf.jira('port'),
    conf.jira('username'),
    conf.jira('password'),
    '2',
    true,
    false)
}
