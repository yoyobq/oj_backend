// app/v2/controller/stuFullInfo.js
// 用于获取用户登录时的验证信息
'use strict';

const Controller = require('egg').Controller;

class EmailsController extends Controller {

  async show() {
    const ctx = this.ctx;
    // const userId = ctx.params.id;
    // console.log(typeof ctx.query);
    const row = ctx.query;
    const user = await ctx.service.v2.emails.show(row);
    // if (user !== null) {
    //   ctx.body = user;
    //   ctx.status = 200;
    // } else {
    //   ctx.status = 404;
    // }
    ctx.body = user;
    ctx.status = 200;
  }

  async index() {
    const ctx = this.ctx;
    // console.log(ctx.query);
    const params = ctx.query;

    // 没有全文列表的需求，因此只处理带参数的情况
    // if (JSON.stringify(params['证件号码']) !== undefined) {
    const result = await ctx.service.v2.emails.index(params);

    // 注意这条判断，比较容易写错 [] 不是 null，也不是 undefined
    if (result[0] !== undefined) {
      ctx.body = result;
      ctx.status = 200;
    } else {
      ctx.throw(404, '未找到邮件');
    }
  }

  async create() {
    const ctx = this.ctx;
    console.log(ctx.params);
    const params = {
      email: 'yoyobq@foxmail.com',
      subject: 'title',
      text: 'test',
    };

    const result = await ctx.service.v2.emails.create(params);
    console.log(result);
    // if (result.affectedRows) {

    // } else {
    //   ctx.body = {
    //     error: 'CREATE FAILURE',
    //     detail: { message: '服务器内部错误' },
    //   };
    //   ctx.status = 500;
    // }
  }

  async update() {
    const ctx = this.ctx;
    const row = JSON.parse(ctx.query.params);
    // console.log(row.password);
    const result = await ctx.service.v2.emails.update(row);

    if (result.affectedRows) {
      ctx.status = 204;
    }
  }

  async destroy() {
    const ctx = this.ctx;
    // console.log(ctx);
    const params = {
      id: parseInt(ctx.params.id),
    };
    const resultAuth = await ctx.service.v2.stuFullInfo.destroy(params);
    if (resultAuth.affectedRows) {
      const resultAcc = await ctx.service.v2.accounts.destroy(params);
      if (resultAcc.affectedRows) {
        const resultInfo = await ctx.service.v2.informations.destroy(params);
        if (resultInfo.affectedRows) {
          ctx.body = null;
          ctx.status = 201;
        }
      }
    } else {
      ctx.body = {
        error: 'NOT IMPLEMENTED',
        // 在egg官方文档里，detail给了个对象数组[{  }]，个人认为不存在数组的必要
        // 因此把他简化成了一个对象 {}
        detail: { message: '删除帐号', field: '', code: '' },
      };
      ctx.status = 501;
    }
  }
}

module.exports = EmailsController;
