// app/v2/controller/stuFullInfo.js
// 用于获取用户登录时的验证信息
'use strict';

const Controller = require('egg').Controller;

class EmailsController extends Controller {
  async create() {
    const ctx = this.ctx;
    const params = ctx.request.body.data;
    // console.log(params.email);
    const result = await ctx.service.v2.emails.create(params);
    if (result) {
      ctx.status = 200;
    } else {
      ctx.body = {
        error: 'CREATE FAILURE',
        detail: { message: '服务器内部错误' },
      };
      ctx.status = 500;
    }
  }
}

module.exports = EmailsController;
