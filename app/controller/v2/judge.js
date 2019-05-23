// app/v2/controller/judge.js
// 用于测试代码，并返回规定信息
'use strict';
const Controller = require('egg').Controller;
const { exec } = require('child_process');
const { promisify } = require('util');
const { access } = require('fs');

class JudgeController extends Controller {
  async judge() {
    const ctx = this.ctx;
    // console.log(ctx.request.body.data.code);
    const params = ctx.request.body.data;

    const quest = await ctx.service.v2.codingQuestions.show({ id: params.cqId });

    if (quest === null) {
      ctx.throw(406, '该编程题不存在');
    }

    const judgeFile = params.cqId + '-' + params.uId + '.' + quest.programLang;
    const fileUrl = '/var/www/oj_reserve/submitCode/' + judgeFile;

    // 检测文件夹是否存在的异步版本
    const accessPromise = promisify(access);
    await accessPromise(fileUrl).catch(function() {
      ctx.throw(406, '尚未生成判题文件，无法判题');
    });

    const execPromise = promisify(exec);
    // console.log('node ' + fileUrl);
    // 执行 'node /var/www/oj_reserve/submitCode/5-1.js';
    await execPromise('node ' + fileUrl).then(function(result) {
      ctx.body = result;
      ctx.status = 200;
    }).catch(function(err) {
      ctx.throw(400, err);
    });
  }
}

module.exports = JudgeController;
