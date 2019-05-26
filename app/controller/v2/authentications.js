// app/v2/controller/authentications.js
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
    const user = await ctx.service.v2.authentications.show(row);
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
    const result = await ctx.service.v2.authentications.index(params);

    // 注意这条判断，比较容易写错 [] 不是 null，也不是 undefined
    if (result[0] !== undefined) {
      ctx.body = result;
      ctx.status = 200;
    } else {
      ctx.body = {
        // 此处 error 是给用户看的信息
        error: '用户不存在或密码有误',
        // 在egg官方文档里，detail给了个对象数组[{  }]，个人认为不存在数组的必要
        // 因此把他简化成了一个对象 {}
        // detail 是给 debug 看的错误
        detail: { message: 'not found', field: '', code: '' },
      };
      ctx.status = 404;
    }
  }

  async create() {
    const ctx = this.ctx;
    const params = this.ctx.request.body.data;
    params.uuid = UUID.v1();
    params.permission = '[1]'; // [0]
    params.avatarPath = 'avatar' + Math.floor(Math.random() * 6 + 1) + '.jpg';
    // {
    //   uuid: UUID.v1(),
    //   username: ctx.request.body.username,
    //   password: ctx.request.body.password,
    //   realName: ctx.request.body.realName,
    //   permission: 1,
    //   avatarPath: 'avatar' + Math.floor(Math.random() * 6 + 1) + '.jpg',
    // };
    // 表authentications内添加数据
    // console.log(params);
    const result = await ctx.service.v2.authentications.create(params);
    if (result.affectedRows) {
      // console.log(result);
      ctx.body = result;
      ctx.status = 201;
      // console.log(result.insertId);
      // const newAccount = {
      //   id: result.insertId,
      //   avatarPath: 'avatar' + Math.floor(Math.random() * 6 + 1) + '.jpg',
      // };
      // 注意，换表了 表accounts
      // const result2 = await ctx.service.v2.accounts.create(newAccount);
      // if (result2.affectedRows) {
      //   const newInfo = {
      //     id: result2.insertId,
      //   };
      //   const result3 = await ctx.service.v2.informations.create(newInfo);
      //   if (result3.affectedRows) {
      //     // console.log(result3);
      //     ctx.body = result3;
      //     ctx.status = 201;
      //   } else {
      //     ctx.status = 500;
      //   }
      // } else {
      //   ctx.status = 500;
      // }
    } else {
      ctx.body = {
        error: 'CREATE FAILURE',
        detail: { message: '服务器内部错误' },
      };
      ctx.status = 500;
    }
  }

  async update() {
    // 此处update仅处理了用户登录时的情况
    // 网站开发过不了多久一定会有修改用户密码之类的需求
    // 会影响到此处代码的执行
    // 目前想到的解决方法是判断  ctx.params 下是否存在password 等需要修改的字段
    // 若无，用现代码，若有，添加新代码
    const ctx = this.ctx;
    let row = this.ctx.request.body.data;

    if (row === undefined) {
      let timeStr = (new Date()).toLocaleString();
      // 获取当前日期
      timeStr = timeStr.replace(/\//g, '-');
      // 替换2017/05/03 为    2017-05-03
      row = {
        id: ctx.params.id,
        lastLoginTime: timeStr,
        lastLoginIP: ctx.request.header['x-forwarded-for'],
      };
    }

    const result = await ctx.service.v2.authentications.update(row);
    // console.log(result);
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
    const resultAuth = await ctx.service.v2.authentications.destroy(params);
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

module.exports = AuthenticationsController;
