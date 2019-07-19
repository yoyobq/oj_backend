// app/v2/controller/count.js
// 用于返回对应表的全部记录数，这并不是一个严格意义上的RESTful接口

'use strict';

const Controller = require('egg').Controller;

class CountController extends Controller {
  async count() {
    const ctx = this.ctx;
    const tableName = await this.getTableName(ctx.params.resources);
    // console.log(tableName);
    const params = JSON.parse(ctx.query.where);
    // console.log(params);
    let result;
    if (Object.keys(params).length !== 0) {
      result = await ctx.service.v2.count.count(tableName, params);
    } else {
      result = await ctx.service.v2.count.fastCount(tableName);
    }

    // 防止0个记录也被作为false，返回406
    if (result === 0 || result) {
      ctx.body = result;
      ctx.status = 200;
    } else {
      ctx.throw(500, '服务器错误');
    }
  }

  async getTableName(resources) {
    const ctx = this.ctx;
    switch (resources) {
      case 'codingQuestions':
        return 'edu_coding_questions';
      case 'codingRecords':
        return 'edu_coding_records';
      case 'stuInfos':
        return 'edu_stu_info';
      default: ctx.throw(406, '暂不支持查询' + resources + '资源的记录条数');
    }
  }
}

module.exports = CountController;
