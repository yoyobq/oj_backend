// app/v1/controller/examLists.js
// 用于获取用户登录时的验证信息
'use strict';

const Controller = require('egg').Controller;

class ExamListsController extends Controller {

  // async show() {
  //   const ctx = this.ctx;
  //   console.log(ctx);
  //   const userId = ctx.params.id;
  //   const user = await ctx.service.examLists.v1.show(userId);
  //   if (user !== null) {
  //     ctx.body = user;
  //     ctx.status = 200;
  //   } else {
  //     ctx.status = 404;
  //   }
  // }

  async index() {
    const ctx = this.ctx;
    const params = ctx.params;
    const result = await ctx.service.v1.examLists.index(params);

    // console.log(result[0]);
    // 注意这条判断，比较容易写错 [] 不是 null，也不是 undefined
    if (result[0] !== undefined) {
      ctx.body = result;
      ctx.status = 200;
    } else {
      ctx.body = {
        error: 'NOT FOUND',
        detail: { message: '没有该班级的考试信息', field: '', code: '' },
      };
      ctx.status = 404;
    }
  }
}

module.exports = ExamListsController;
