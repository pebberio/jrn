'use strict';

process.chdir(__dirname);
import conf from "./conf";

if(!conf.checkConfig()) {
  conf.setConfig();
} else {
  require('./ask').start();
}
