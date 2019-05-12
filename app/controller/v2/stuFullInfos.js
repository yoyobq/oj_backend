// app/v2/controller/stuFullInfo.js
// 用于获取用户登录时的验证信息
'use strict';

const Controller = require('egg').Controller;

class StuFullInfosController extends Controller {

  async show() {
    const ctx = this.ctx;
    // const userId = ctx.params.id;
    // console.log(typeof ctx.query);
    const row = ctx.query;
    const user = await ctx.service.v2.stuFullInfos.show(row);
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
    if (JSON.stringify(params['证件号码']) !== undefined) {
      const result = await ctx.service.v2.stuFullInfos.index(params);

      // 注意这条判断，比较容易写错 [] 不是 null，也不是 undefined
      if (result[0] !== undefined) {
        ctx.body = result;
        ctx.status = 200;
      } else {
        ctx.throw(404, '未找到该身份证号的相关信息，请检查输入');
      }
    } else {
      ctx.throw(400, '参数不正确，必须提供证件号码');
    }
  }

  async create() {
    const ctx = this.ctx;
    const params = {
      username: ctx.query.username,
      password: ctx.query.password,
    };
    // 表stuFullInfo内添加数据
    const result = await ctx.service.v2.stuFullInfos.create(params);
    if (result.affectedRows) {
      // console.log(result.insertId);
      const newAccount = {
        id: result.insertId,
        avatarPath: 'avatar' + Math.floor(Math.random() * 6 + 1) + '.jpg',
      };
      // 注意，换表了 表accounts
      const result2 = await ctx.service.v2.accounts.create(newAccount);
      if (result2.affectedRows) {
        const newInfo = {
          id: result2.insertId,
        };
        const result3 = await ctx.service.v2.informations.create(newInfo);
        if (result3.affectedRows) {
          // console.log(result3);
          ctx.body = result3;
          ctx.status = 201;
        } else {
          ctx.status = 500;
        }
      } else {
        ctx.status = 500;
      }
    } else {
      ctx.body = {
        error: 'CREATE FAILURE',
        detail: { message: '服务器内部错误' },
      };
      ctx.status = 500;
    }
  }

  async update() {
    const ctx = this.ctx;
    const row = JSON.parse(ctx.query.params);
    // console.log(row.password);
    const result = await ctx.service.v2.stuFullInfos.update(row);

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

module.exports = StuFullInfosController;
