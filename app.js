'use strict';

// settings
process.chdir(__dirname);
var config = require("config");
var chalk = require('chalk');
var JiraApi = require('jira').JiraApi;
var inquirer = require("inquirer");
var async = require("async");

var jira = new JiraApi(
  config.get('Jira.protocol'),
  config.get('Jira.host'),
  config.get('Jira.port'),
  config.get('Jira.username'),
  config.get('Jira.password'),
  '2',
  true,
  false);

/**
 * print a blue line
 */
var line = function () {
  console.log(chalk.blue("-------------------------------------"));
};

/**
 * exit app with message
 * @param msg
 */
function exit(msg) {
  console.log(msg);
  process.exit(1);
}

/**
 * render projects for choices ID: Name
 * @param projects
 * @returns {Array}
 */
function renderProjects(projects) {
  var ret = [];
  for (var project in projects) {
    var data = projects[project];
    if (config.get('Jira.projects').indexOf(data.key) >= 0) {
      ret.push(data.key);
    }
  }

  return ret;
}

/**
 * render issueTypes for choices ID: Name
 * @param types
 * @returns {Array}
 */
function renderIssueTypes(types) {
  var ret = [];
  for (var type in types) {
    var data = types[type];
    if (config.get('Jira.issueTypes').indexOf(data.id) >= 0) {
      ret.push(data.name);
    }
  }

  return ret;
}

function renderTransitions(transitions) {
  var ret = [];
  ret.push("NO THANKS");
  for (var transition in transitions) {
    var data = transitions[transition];
    ret.push(data.id + ': ' + data.name);
  }
  return ret;
}

function transitionPrompt(issueKey) {
  jira.listTransitions(issueKey, function (error, res) {
    var transitions = renderTransitions(res);
    if (transitions.length == 0) {
      exit("No transitions found");
    }

    var prompts = [{
      type: 'list',
      name: 'transition',
      message: 'Do you want to execute a transition',
      choices: transitions,
      filter: function (value) {
        return value === "NO THANKS" ? "" : value.split(':').shift();
      }
    }];

    var prompt = inquirer.createPromptModule();

    // start asking the user
    prompt(prompts).then(answers => {
      if (answers.transition) {
        jira.transitionIssue(issueKey, {"transition": {"id": answers.transition}}, function (error, res) {
          if (error) {
            exit("Transition failed " + error)
          }
          if (res.statusCode !== 200) {
            console.log(chalk.green('Transition successfully executed'));
          }
        });
      }
    });
  });
}

/* START
 * *************************/
console.log("");

// start synchron functions
async.series({
  // get all visible projects and filter by config
  getProjects: function (callback) {
    // try get issues in process
    jira.listProjects(function (error, res) {

      // render issues for choice question
      var projects = renderProjects(res);

      if (projects.length == 0) {
        exit("No Projects found");
      }

      callback(null, projects);

    });

  },
  // get all visible issueTypes and filter by config
  getIssueTypes: function (callback) {
    jira.listIssueTypes(function (error, res) {

      var types = renderIssueTypes(res);
      if (types.length == 0) {
        exit("No Type found");
      }

      callback(null, types);
    });
  },
  // get all active and future sprints
  getSprints: function (callback) {

    // build the request options
    var options = {
      rejectUnauthorized: jira.strictSSL,
      uri: jira.makeUri("/board/" + config.get('Sprint.rapidView') + "/sprint?state=" + config.get("Sprint.state"), "rest/agile/", "1.0"),
      method: 'GET',
      json: true
    };

    // execute request to get current sprints
    jira.doRequest(options, function (error, response) {

      if (error) {
        callback(error, null);
        return;
      }

      if (response.statusCode === 404) {
        callback('Invalid URL');
        return;
      }

      if (response.statusCode !== 200) {
        callback(response.statusCode + ': Unable to connect to JIRA during Sprint search.');
        return;
      }

      var ret = [];

      if (response.body !== null) {
        var rapidViews = response.body.values;

        for (var i = 0; i < rapidViews.length; i++) {
          ret.push(rapidViews[i].id + ": " + rapidViews[i].name + " (" + rapidViews[i].state + ")");
        }

      }

      // add an BACKLOG entry. The User can choose this, if adding a sprint is not wanted
      ret.push("BACKLOG");

      callback(null, ret);

    });

  }
}, function (err, res) {

  // Prompts
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
      return value === "BACKLOG" ? "" : value.split(':').shift();
    }
  }];

  var prompt = inquirer.createPromptModule();


  // start asking the user
  prompt(prompts).then(answers => {
    // create the issue json data
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

    // add sprint to issue if set
    if (answers.sprint !== "") {
      issue["fields"]["customfield_" + config.get('Sprint.customFieldId')] = parseInt(answers.sprint);
    }

    // create issue in jira
    jira.addNewIssue(issue, function (err, res) {
      line();
      if (err === null) {
        console.log("issue created");
        line();
        console.log("KEY: " + res.key);
        console.log("URL: " + chalk.green(config.get('Jira.protocol') + "://" + config.get('Jira.host') + ":" + config.get('Jira.port') + "/browse/" + res.key) + " (cmd+click)");
        //console.log("API: " + res.self);

        transitionPrompt(res.key);

      } else {
        console.log("an error occured");
        line();
        console.log(err, res);
      }
      line();
    });
  });
});

