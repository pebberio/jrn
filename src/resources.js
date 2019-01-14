var jira = require('./jira-login').setup();
var conf = require('./conf');
var helper = require('./helper');

module.exports =  {
  getProjects: function(answers) {
    return new Promise(function (resolve, reject) {
      jira.listProjects(function (error, projects) {
        if (error) {
          reject(error);
        } else {
          resolve(helper.renderProjects(projects));
        }
      });
    });
  },
  getIssueTypes: function(answers) {
    return new Promise(function(resolve, reject) {
      jira.listIssueTypes(function (error, issueTypes) {
        if (error) {
          reject(error);
        } else {
          resolve(helper.renderIssueTypes(issueTypes));
        }
      });
    })
  },
  getSprints: function(answers) {
    return new Promise(function(resolve, reject) {
      var uri = "/board/" + conf.sprint('rapidView') + "/sprint?state=" + conf.sprint('state');
      var options = {
        rejectUnauthorized: jira.strictSSL,
        uri: jira.makeUri(uri, "rest/agile/", "1.0"),
        method: 'GET',
        json: true
      };
      jira.doRequest(options, function (error, sprints) {
        if (error) {
          reject(error);
        } else {
          resolve(helper.renderSprints(sprints, conf.BACKLOG_KEY));
        }
      });
    })
  }
};
