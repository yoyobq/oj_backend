// app/v2/controller/testPrograms.js
// 用于存放不同语言的
// 不同输入输出数据（结构，数据类型）
// 的统一的测试代码

'use strict';
const Controller = require('egg').Controller;

class TestProgramsController extends Controller {
  async show() {
    const ctx = this.ctx;
    const row = ctx.params;
    const result = await ctx.service.v2.testPrograms.show(row);


    if (result) {
      ctx.body = result;
      ctx.status = 200;
    } else {
      ctx.throw(404, '无此判题记录');
    }

  }

  async index() {
    const ctx = this.ctx;
    const query = ctx.query;
    const params = {};

    // 尽量不要出现下列情况：
    // 若前端传来的
    // query字符串(data)和 params(?limit=2&offset=3)中同时存在定义
    // 则以query中的为准
    if (query.limit !== undefined) {
      params.limit = parseInt(query.limit);
      delete query.limit;
    }
    if (query.offset !== undefined) {
      params.offset = parseInt(query.offset);
      delete query.offset;
    }

    // 详见codingRecords中的相关说明，此接口未开启，保留后用
    // if (Object.keys(ctx.params).length !== 0) {
    //   // 若在url中存在 uId，或cqId，合并到查询条件中
    //   // 若查询条件中也存在uId/cqId，覆盖之
    //   query = Object.assign(query, ctx.params);
    // }
    params.where = query;
    // console.log(params);
    if (params !== undefined) { // 此处应对params做验证，稍后添加(允许null)
      const result = await ctx.service.v2.testPrograms.index(params);
      // 注意这条判断，比较容易写错 [] 不是 null，也不是 undefined
      if (result[0] !== undefined) {
        ctx.body = result;
        ctx.status = 200;
      } else {
        ctx.throw(404, '未找到相关判题程序记录，请检查输入');
      }
    } else {
      ctx.throw(400, '参数不正确');
    }
  }

  async create() {
    const ctx = this.ctx;
    const params = ctx.request.body.data;

    // 此处可增加对个字段的验证
    const result = await ctx.service.v2.testPrograms.create(params);
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

    // 以下内容应该由egg的插件完成，这里只是提供一个临时的方法
    // inputData,outputData都应该是 JSON字符串
    if (params.inputData !== undefined) {
      if (!(await this.isJsonString(params.inputData))) {
        ctx.throw(406, 'inputData不是JSON字符串');
      }
    }

    if (params.outputData !== undefined) {
      if (!(await this.isJsonString(params.outputData))) {
        ctx.throw(406, 'outputData不是JSON字符串');
      }
    }
    // 以上

    params.id = row.id;
    const result = await ctx.service.v2.testPrograms.update(params);

    if (result.affectedRows) {
      ctx.status = 204;
    } else {
      ctx.status = 501;
    }
  }

  async destroy() {
    const ctx = this.ctx;
    const row = ctx.params;

    const result = await ctx.service.v2.testPrograms.destroy(row);
    if (result.affectedRows) {
      ctx.status = 202;
    } else {
      ctx.throw(404, '删除失败');
    }
  }

  async isJsonString(str) {
    try {
      if (typeof JSON.parse(str) === 'object') {
        return true;
      }
    // 此处catch无需处理，禁用eslint自动查错
    // eslint-disable-next-line no-empty
    } catch (e) {
    }
    return false;
  }
}

module.exports = TestProgramsController;
