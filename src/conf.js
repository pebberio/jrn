var config = require("config");

const CONFIG_JIRA_KEY = "Jira";
const CONFIG_SPRINT_KEY = "Sprint";
const PROFILE = process.env.JRN_PROFILE;

function valueOf(key, name) {
  const keyWithProfile = key + '_' + PROFILE + '.' + name;
  return PROFILE
    && config.has(keyWithProfile)
    && config.get(keyWithProfile)
    || config.get(key + '.' + name);
}

module.exports = {
  jira: function(name) {
    return valueOf(CONFIG_JIRA_KEY,  name);
  },
  sprint: function(name) {
    return valueOf(CONFIG_SPRINT_KEY,  name);
  }
};
