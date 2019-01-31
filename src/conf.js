import fs from "fs";
import {homedir} from 'os'
import inquirer from "inquirer";
import Profile from "./profile";
import yaml from "js-yaml";
import chalk from "chalk";

const CONFIG_JIRA_KEY = "Jira";
const CONFIG_SPRINT_KEY = "Sprint";
const PROFILE = process.env.JRN_PROFILE;

let CONFIG_FILE = "";
let CONFIG_PATH = "";
let CONFIG = "";


const getCfgPath = () => {
  CONFIG_PATH = homedir + '/.pebberio_jrn/';
  return CONFIG_PATH;
};

const getConfigFile = () => {
  CONFIG_FILE = getCfgPath() + 'config.json';
  return CONFIG_FILE;
};

module.exports = {

  jira: function (name) {
    return this.valueOf(CONFIG_JIRA_KEY, name);
  },
  sprint: function (name) {
    return this.valueOf(CONFIG_SPRINT_KEY, "sprint" + name[0].toUpperCase() + name.slice(1));
  },
  loadConfig: function () {
    CONFIG = yaml.safeLoad(fs.readFileSync(CONFIG_FILE, 'utf8'));
  },
  checkConfig: function () {
    getCfgPath();
    getConfigFile();
    if (!fs.existsSync(CONFIG_PATH)) {
      fs.mkdirSync(CONFIG_PATH);
    }
    let configured = fs.existsSync(CONFIG_FILE);
    if (configured) {
      this.loadConfig();
    }
    return configured;
  },
  valueOf: (key, name) => {
    return PROFILE
      && typeof CONFIG[PROFILE][name] !== "undefined"
      && CONFIG[PROFILE][name]
      || CONFIG["default"][name];
  },
  setConfig: function () {
    if (!this.checkConfig()) {
      console.log(chalk.green("STARTING INITIAL CONFIGURATION"));
      let prompts = [{
        type: 'input',
        name: 'protocol',
        message: 'Protocol',
        default: 'https'
      }, {
        type: 'input',
        name: 'host',
        message: 'Jira Host (jira.domain.tld)'
      }, {
        type: 'input',
        name: 'port',
        message: 'Port',
        default: 443
      }, {
        type: 'input',
        name: 'username',
        message: 'Username'
      }, {
        type: 'password',
        name: 'password',
        message: 'password'
      }, {
        type: 'input',
        name: 'projects',
        message: 'Projects (comma separated string)',
        validate: function (value) {
          return value.length > 0;
        }
      }, {
        type: 'input',
        name: 'issueTypes',
        message: 'IssueTypes(comma separated IDs)',
        validate: function (value) {
          return value.length > 0;
        }
      }, {
        type: 'input',
        name: 'sprintRapidView',
        message: 'Sprint RapidView / Board (number)',
        default: 5
      }, {
        type: 'input',
        name: 'sprintCustomFieldId',
        message: 'Sprint CustomFieldId (number)',
        default: 10100
      }];

      var prompt = inquirer.createPromptModule();

      prompt(prompts).then(answers => {

        let def = new Profile();
        def.protocol = answers.protocol;
        def.host = answers.host;
        def.port = answers.port;
        def.username = answers.username;
        def.password = answers.password;
        def.projects = answers.projects.split(",").map(item => item.trim());
        def.issueTypes = answers.issueTypes.split(",").map(item => item.trim());

        def.sprintRapidView = answers.sprintRapidView;
        def.sprintCustomFieldId = answers.sprintCustomFieldId;
        def.sprintState = 'active,future';

        fs.writeFileSync(CONFIG_FILE, yaml.safeDump({default: def}))
      });
    }
  },
  BACKLOG_KEY: "BACKLOG"
};
