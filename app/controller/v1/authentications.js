// app/v1/controller/authentications.js
// 用于获取用户登录时的验证信息
'use strict';

const Controller = require('egg').Controller;
const UUID = require('node-uuid');

class AuthenticationsController extends Controller {

  async show() {
    const ctx = this.ctx;
    // const userId = ctx.params.id;
    // console.log(typeof ctx.query);
    const row = ctx.query;
    // console.log(row);
    const user = await ctx.service.v1.authentications.show(row);
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
    const result = await ctx.service.v1.authentications.index(params);

    // 注意这条判断，比较容易写错 [] 不是 null，也不是 undefined
    if (result[0] !== undefined) {
      ctx.body = result;
      ctx.status = 200;
    } else {
      ctx.body = {
        error: 'NOT FOUND',
        // 在egg官方文档里，detail给了个对象数组[{  }]，个人认为不存在数组的必要
        // 因此把他简化成了一个对象 {}
        detail: { message: '用户不存在或密码有误', field: '', code: '' },
      };
      ctx.status = 404;
    }
  }

  async create() {
    const ctx = this.ctx;
    const params = {
      uuid: UUID.v1(),
      username: ctx.query.username,
      password: ctx.query.password,
    };
    // 表authentications内添加数据
    const result = await ctx.service.v1.authentications.create(params);
    if (result.affectedRows) {
      // console.log(result.insertId);
      const newAccount = {
        id: result.insertId,
        avatarPath: 'avatar' + Math.floor(Math.random() * 6 + 1) + '.jpg',
      };
      // 注意，换表了 表accounts
      const result2 = await ctx.service.v1.accounts.create(newAccount);
      if (result2.affectedRows) {
        const newInfo = {
          id: result2.insertId,
        };
        const result3 = await ctx.service.v1.informations.create(newInfo);
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
    const result = await ctx.service.v1.authentications.update(row);

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
    const resultAuth = await ctx.service.v1.authentications.destroy(params);
    if (resultAuth.affectedRows) {
      const resultAcc = await ctx.service.v1.accounts.destroy(params);
      if (resultAcc.affectedRows) {
        const resultInfo = await ctx.service.v1.informations.destroy(params);
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

module.exports = AuthenticationsController;
