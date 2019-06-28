// app/v2/controller/codingRecords.js
// 用于测试代码是否正确
'use strict';
const Controller = require('egg').Controller;

class CodingRecordsController extends Controller {
  async show() {
    const ctx = this.ctx;
    const row = ctx.params;
    const result = await ctx.service.v2.codingRecords.show(row);


    if (result) {
      ctx.body = result;
      ctx.status = 200;
    } else {
      ctx.throw(404, '未找到对应做题记录');
    }

  }

  async index() {
    const ctx = this.ctx;
    const query = ctx.query;
    const params = {};

    if (query.where) {
      params.where = JSON.parse(query.where);
    }
    if (query.limit !== undefined) {
      params.limit = parseInt(query.limit);
    }
    if (query.offset !== undefined) {
      params.offset = parseInt(query.offset);
    }

    // 以下代码用于适配实验性路由中的:uId 或 :cqId
    // Object.keys是es6特性，该方法会返回一个由一个给定对象的自身可枚举属性组成的数组，
    // 数组中属性名的排列顺序和使用 for...in 循环遍历该对象时返回的顺序一致。
    // 在这里用于判断是否是空对象
    if (Object.keys(ctx.params).length !== 0) {
      // 若在url中存在 uId，或cqId，合并到查询条件中
      // 若查询条件中也存在uId/cqId，覆盖之
      params.where = Object.assign(params.where, ctx.params);
    }
    console.log(params.where);
    if (params !== undefined) { // 此处应对params做验证，稍后添加(允许null)
      const result = await ctx.service.v2.codingRecords.index(params);
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
    let queryObj = {};
    const keyParams = {};

    keyParams.uId = params.uId;
    keyParams.cqId = params.cqId;
    // 存在完成，解决，超时的记录不得添加新纪录
    keyParams.status = [ 'done', 'unsolved', 'timeout' ];
    queryObj.where = keyParams;
    // console.log(queryObj.where);
    const existRecord = await ctx.service.v2.codingRecords.index(queryObj);
    if (existRecord[0] !== undefined) {
      ctx.throw(409, '做题记录已存在');
    }

    queryObj = {};
    queryObj.id = params.uId;
    const existStu = await ctx.service.v2.stuInfos.show(queryObj);
    if (existStu === null) {
      ctx.throw(406, 'id为 ' + params.uId + ' 的学生不存在');
    }

    queryObj.id = params.cqId;
    const existQuest = await ctx.service.v2.codingQuestions.show(queryObj);
    if (existQuest === null) {
      ctx.throw(406, 'id为 ' + params.cqId + ' 的程序题不存在');
    }

    const result = await ctx.service.v2.codingRecords.create(params);
    if (result.affectedRows) {
      // console.log(result);
      ctx.body = result.insertId;
      ctx.status = 201;
    } else {
      ctx.body = {
        error: 'CREATE FAILURE',
        detail: { message: '服务器内部错误' },
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

    const result = await ctx.service.v2.codingRecords.update(params);

    if (result.affectedRows) {
      ctx.status = 204;
    } else {
      ctx.status = 501;
    }
  }

  async destroy() {
    const ctx = this.ctx;
    const row = ctx.params;

    const result = await ctx.service.v2.codingRecords.destroy(row);
    if (result.affectedRows) {
      ctx.body = null;
      ctx.status = 202;
    } else {
      // ctx.body = {
      //   error: 'NOT IMPLEMENTED',
      //   detail: { message: '删除失败，未找到对应信息', field: '', code: '' },
      // };
      // ctx.status = 501;
      ctx.throw(404, '删除失败，未找到对应信息');
    }
  }
}

module.exports = CodingRecordsController;
