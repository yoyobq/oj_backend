// app/v2/controller/judge.js
// 用于测试代码是否正确
'use strict';
const Controller = require('egg').Controller;
const { execSync } = require('child_process');

// 获取绝对路径，否则获取到的根目录是网站根目录
const { URL } = require('url');
const fs = require('fs');

class JudgeController extends Controller {
  async judge() {
    const ctx = this.ctx;
    // console.log(ctx.request.body.data.code);
    const theCode = ctx.request.body.data.code;
    const fileUrl = new URL('file:///var/www/oj_reserve/submitCode/submitCode.js');

    try {
      // 此处本想用异步形式写入，执行代码，提高效率
      // 但需要套promise方法，暂时使用同步方法
      // writeFileSync只有出错才会返回error，所以用try，catch处理错误
      fs.writeFileSync(fileUrl, theCode, 'utf-8');

      // 写入成功后，无论正确输出还是错误输出均不应该作为异常处理
      // 因此把catch到的错误也作为成功响应的status 200 输出到前端
      try {
        const result = execSync('node /var/www/oj_reserve/1-sumArr/run.js', { encoding: 'utf-8' });
        ctx.body = result;
      } catch (error) {
        // ！！！！！目前输出了完整的错误代码，很危险需要改进！！！！！
        // 很多网站并不返回错误，也是个偷懒的好办法
        ctx.body = error.stderr;
      } finally {
        ctx.status = 200;
      }
    } catch (error) {
      ctx.throw(406, '无法收录代码，请检查提交数据');
    }
  }
}

module.exports = JudgeController;
