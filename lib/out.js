'use strict';


/**
 * chalk 包的作用是修改控制台中字符串的样式
 * https://segmentfault.com/a/1190000011808938
 * https://blog.csdn.net/Jeane_210/article/details/108445613
 */
const chalk = require('chalk');

module.exports = {
  /**
   * ...args参数的意思是：剩余参数意思，剩余参数语法允许我们将一个不定数量的参数表示为一个数组
   * https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Functions/Rest_parameters
   */
  info(...args) {
    const prefix = chalk.green('[INFO]');
    /**
     * unshift() 方法将一个或多个元素添加到数组的开头，并返回该数组的新长度(该方法修改原有数组)。
     */
    args.unshift(prefix);
    /**
     * apply() 方法调用一个具有给定this值的函数，以及以一个数组（或类数组对象）的形式提供的参数。
     * https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Function/apply
     */
    console.log.apply(console, args);
  },
  warn(...args) {
    const prefix = chalk.yellow('[WARNING]');
    args.unshift(prefix);
    console.log.apply(console, args);
  },
  error(...args) {
    const prefix = chalk.red('[ERROR]');
    args.unshift(prefix);
    console.log.apply(console, args);
  },
};
