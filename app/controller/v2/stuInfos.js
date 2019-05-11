// app/v2/controller/stuInfos.js
// 用于获取用户登录时的验证信息
'use strict';

const Controller = require('egg').Controller;

class StuInfosController extends Controller {

  async show() {
    const ctx = this.ctx;
    let row;
    // const userId = ctx.params.id;
    if (ctx.params.id !== undefined) {
      row = ctx.params;
    } else {
      // 此处未完善
      row = ctx.request.body.data;
    }
    // console.log(row);
    const user = await ctx.service.v2.stuInfos.show(row);
    if (user !== null) {
      ctx.body = user;
      ctx.status = 200;
    } else {
      ctx.throw(404, { message: '未找到对应帐号', field: '', code: '404' });
    }
  }

  async index() {
    const ctx = this.ctx;
    // console.log(ctx.query);
    const params = ctx.query;

    // 没有全文列表的需求，因此只处理带参数的情况
    if (JSON.stringify(params.idNumber) !== undefined) {
      const result = await ctx.service.v2.stuInfos.index(params);
      // console.log(result);
      // 注意这条判断，比较容易写错 [] 不是 null，也不是 undefined
      if (result[0] !== undefined) {
        ctx.body = result;
        ctx.status = 200;
      } else {
        ctx.throw(404, { message: '未找到身份证号的相关信息，请检查输入', field: '', code: '404' });
        // ctx.throw(404, '未找到身份证号的相关信息，请检查输入');
      }
    } else {
      ctx.throw(400, '参数不正确');
    }
  }

  async create() {
    const ctx = this.ctx;
    const params = this.ctx.request.body.data;
    // 表 stuInfos 内添加数据
    // console.log(params);
    const result = await ctx.service.v2.stuInfos.create(params);
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
    const ctx = this.ctx;
    const row = this.ctx.request.body.data;
    // console.log(ctx.query);
    const result = await ctx.service.v2.stuInfos.update(row);
    if (result.affectedRows) {
      ctx.status = 204;
    }
  }
}

module.exports = StuInfosController;
