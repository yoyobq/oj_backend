// app/v2/controller/codingQuestions.js
// 用于测试代码是否正确
'use strict';
const Controller = require('egg').Controller;

class CodingQuestionsController extends Controller {
  async show() {
    const ctx = this.ctx;
    const row = ctx.params;
    // console.log(row);
    const result = await ctx.service.v2.codingQuestions.show(row);


    if (result) {
      // 往header里面塞数据的一次尝试
      // 注意前端的api只返回成功数据的 res.data
      // ctx.set('myData', '1');
      ctx.body = result;
      ctx.status = 200;
    } else {
      ctx.throw(404, '未找到对应程序题');
    }

  }

  async index() {
    const ctx = this.ctx;

    const query = ctx.query;
    const params = {};

    if (query.limit !== undefined) {
      params.limit = parseInt(query.limit);
      delete query.limit;
    }
    if (query.offset !== undefined) {
      params.offset = parseInt(query.offset);
      delete query.offset;
    }

    params.where = query;

    if (params !== undefined) { // 此处应对params做验证，稍后添加(允许null)
      const result = await ctx.service.v2.codingQuestions.index(params);

      // 注意这条判断，比较容易写错 [] 不是 null，也不是 undefined
      if (result[0] !== undefined) {
        ctx.body = result;
        ctx.status = 200;
      } else {
        ctx.throw(404, '未找到相关信息，请检查输入');
      }
    } else {
      ctx.throw(400, '参数不正确');
    }
  }

  async create() {
    const ctx = this.ctx;
    const params = ctx.request.body.data;

    // 此处是否应判断是否存在类似题目？如何判断？
    const result = await ctx.service.v2.codingQuestions.create(params);
    if (result.affectedRows) {
      // console.log(result);
      ctx.body = result.insertId;
      ctx.status = 201;
    } else {
      ctx.body = {
        error: '服务器内部错误',
      };
      ctx.status = 501;
    }
  }

  async update() {
    const ctx = this.ctx;
    const row = ctx.params;
    const params = this.ctx.request.body.data;

    params.id = row.id;
    // console.log(row)
    // console.log(params);

    const result = await ctx.service.v2.codingQuestions.update(params);

    if (result.affectedRows) {
      ctx.status = 204;
    } else {
      ctx.status = 501;
    }
  }

  async destroy() {
    const ctx = this.ctx;
    const row = ctx.params;

    const result = await ctx.service.v2.codingQuestions.destroy(row);
    if (result.affectedRows) {
      ctx.body = null;
      ctx.status = 202;
    } else {
      // ctx.body = {
      //   error: 'NOT IMPLEMENTED',
      //   detail: { message: '删除失败，未找到对应信息', field: '', code: '' },
      // };
      // ctx.status = 501;
      ctx.throw(404, '删除失败');
    }
  }
}

module.exports = CodingQuestionsController;
