// app/v2/controller/exerciseRecords.js
// 用于获取用户登录时的验证信息
'use strict';

const Controller = require('egg').Controller;

class ExerciseRecordsController extends Controller {
  async show() {
    const ctx = this.ctx;
    const params = ctx.params;
    // console.log(params);
    const result = await ctx.service.v2.exerciseRecords.show(params);
    if (result !== null) {
      ctx.body = result;
      ctx.status = 200;
    } else {
      ctx.throw('获取信息失败，请检查日志');
    }
  }
  
  async index() {
    const ctx = this.ctx;
    // console.log(ctx.query);
    const params = ctx.query;
    const result = await ctx.service.v2.exerciseRecords.index(params);

    if (result[0] !== undefined) {
      ctx.body = result;
      ctx.status = 200;
    } else {
      ctx.throw(404, '未找到相关练习的个人记录，请检查输入');
    }
  }

  async create() {
    const ctx = this.ctx;
    const params = this.ctx.request.body.data;
    // 检查是否存在对应记录
    const result = await ctx.service.v2.exerciseRecords.create(params);
    if (result.affectedRows) {
      // console.log(result);
      ctx.body = result;
      ctx.status = 201;
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
    const result = await ctx.service.v2.exerciseRecords.update(row);
    if (result.affectedRows) {
      ctx.status = 204;
    }
  }
}

module.exports = ExerciseRecordsController;
