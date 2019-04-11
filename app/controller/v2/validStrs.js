// app/v2/controller/vaildStrs.js
// 用于获取邮箱验证时的验证字符串
'use strict';

const Controller = require('egg').Controller;

class ValidStrsController extends Controller {
  async show() {
    const ctx = this.ctx;
    // const userId = ctx.params.id;
    // console.log(typeof ctx.query);
    const row = ctx.query;
    const user = await ctx.service.v2.validStrs.show(row);
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
    // 允许params为空
    let params = ctx.query.data;

    if (params !== undefined) {
      // 带参数
      params = JSON.parse(ctx.query.data);
    } else {
      // 全文列表，仅测试阶段开放，后期应关闭
      ctx.throw(403, '查询参数不能为空，只允许查询指定的验证信息');
    }

    const result = await ctx.service.v2.validStrs.index(params);

    // 注意这条判断，比较容易写错 [] 不是 null，也不是 undefined
    if (result[0] !== undefined) {
      ctx.body = result;
      ctx.status = 200;
    } else {
      ctx.throw(404, '未找到验证字符信息');
    }
  }

  async create() {
    const ctx = this.ctx;
    let result;
    let isAllowCreate;
    // const params = ctx.request.body.data;
    const params = ctx.request.body.data;

    // 查询数据库中是已有未过期的验证码信息
    result = await ctx.service.v2.validStrs.index(params);

    if (result[0] !== undefined) {
      const nowDate = Date.now();
      const buildDate = Date.parse(result[0].buildDate);
      const passMinutes = Math.floor((nowDate - buildDate) / 1000 / 60);

      if (passMinutes >= result[0].periodMinutes) {
        isAllowCreate = true;
      } else {
        // 若存在未过期的同类型记录
        isAllowCreate = false;
      }
    }

    if (isAllowCreate) {
      result = await ctx.service.v2.validStrs.create(params);

      if (result.affectedRows) {
        console.log(result);
        ctx.body = {
          id: result.insertId,
          vaildStr: result.vaildStr,
        };
      } else {
        ctx.body = {
          error: 'CREATE FAILURE',
          detail: { message: '服务器内部错误' },
        };
        ctx.status = 500;
      }
    } else {
      ctx.body = {
        error: 'VaildInfo is ready exists',
        detail: {
          message: '已存在未过期的验证码信息，请勿重复添加',
          id: result[0].id,
        },
      };
      ctx.status = 403;
    }
  }

  async update() {
    const ctx = this.ctx;
    const row = JSON.parse(ctx.query.params);
    // console.log(row.password);
    const result = await ctx.service.v2.validStrs.update(row);

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

module.exports = ValidStrsController;
