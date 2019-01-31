# jrn.js
Node Module to create issues in jira by ease

BETA: jrn is working as expected.
It creates an issue, assigns a sprint and execute an optional post transition. 

This is in the early adopter stage. It's usable but not everything is done yet and some things will change. 

![Screenshot](./screenshot.gif)

## Requirements
* [node](https://nodejs.org/)
* [npm](https://www.npmjs.com/)

## Installation
```bash
npm install;
```

### config 
```bash
# create your custom config
cp src/config/default.toml.dist src/config/default.toml;

# modify your local configuration
vim src/config/default.toml;
```


#### Profiles

You can define profiles in your config file.
Simply add a postfix to the categories as mentioned in the 
[src/config/default.toml.dist](src/config/default.toml.dist) like *[Jira_myprofile]* and *[Sprint_myprofile]*

A profile will get active, when the environment variable `JRN_PROFILE` is set.
```
# set an environment variable using export
export JRN_PROFILE=myprofile

# or prefix command with profile
JRN_PROFILE=myprofile jrn
```

This will give us the possibility to make use of jrn for different instanzes, projects, sprints ...

##### Default key:value fallback
The default profile key:value is the fallback value, if it's not set in the profile configuration.
That makes it possible to set defaults like username, password, port only once and not in each profile.

### create alias
```bash
# add "jrn" as alias to the shell
echo "alias jrn='~/workspace/jrn/bin/jrn'" >> ~/.bashrc

# Test des Alias
## reload bashrc
source ~/.bashrc

## execute jrn
jrn
```

## TODOS
* Build + Package to make npm install pebberio/jrn globally possible
* Docker Container
* helper tools, to identify rapidViewId, sprintCustomFieldId, projects and issueTypes
* config wizard
* config verification
* config by env vars
* config by ~/.jrn/config
* config and execution with profiles like aws-cli
* refactoring / cleanup / tweaks
* error handling
    * Jira not accessable
    * wrong credentials / user not authorized or allowed to request X
    * Sprint customField not available in IssueScheme of Project or not assigned to chosen IssueType (isse creation failes)
    * Project does not have given IssueType (take advantages of profiles)
* check if rapidView is really necessary as config param.... (YES, to limit sprint choices)


### NOTICE max 50
Per default, api results are limited to an amount of 50. More is not handled, and might never be handled by jrn.
Let's say you have more than 50+ Projects configured, you'll only get the first 50 to choose from.
When you'll have configured that huge amount, it might be better to use the web gui 
or take advantage of configuration profiles to decrease the amount to create issues with ease using jrn.
