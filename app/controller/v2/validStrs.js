// app/v2/controller/validStrs.js
// 用于获取邮箱验证时的验证字符串
'use strict';
const crypto = require('crypto');
const Controller = require('egg').Controller;

class ValidStrsController extends Controller {
  async show() {
    const ctx = this.ctx;
    const row = ctx.params;
    const result = await ctx.service.v2.validStrs.show(row);

    if (result !== null) {
      const buildDate = Date.parse(result.buildDate);
      const periodMinutes = result.periodMinutes;

      // 此处应注意异步引起的失效问题
      if (await this.isPastDue(buildDate, periodMinutes)) {
        ctx.throw(403, '验证信息已过期');
      } else {
        // 不返回查询到的数据，直接返回验证字符串
        const validStr = await this.createVaildString(result);
        ctx.body = validStr;
        ctx.status = 200;
      }
    } else {
      ctx.throw(404, '未找到对应的验证信息');
    }
  }

  async index() {
    const ctx = this.ctx;
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
    // let result;
    let isAllowCreate = false;
    // const params = ctx.request.body.data;
    const params = ctx.request.body.data;

    // 查询数据库中是已有未过期的验证码信息
    const result = await ctx.service.v2.validStrs.index(params);
    if (result[0] !== undefined) {
      // 若存在，查看是否过期
      const buildDate = Date.parse(result[0].buildDate);
      const periodMinutes = result[0].periodMinutes;

      // console.log(result[0]);
      const isPastDue = await this.isPastDue(buildDate, periodMinutes);
      // 若已经过期，允许生成新验证码
      if (isPastDue) {
        await ctx.service.v2.validStrs.destroy(result[0]);
        isAllowCreate = true;
      }
    } else {
      // 若不存在，允许生成新验证码
      isAllowCreate = true;
    }

    if (isAllowCreate) {
      const result = await ctx.service.v2.validStrs.create(params);
      if (result.affectedRows) {
        const validInfo = await ctx.service.v2.validStrs.show({ id: result.insertId });
        ctx.status = 200;
        ctx.body = {
          id: result.insertId,
          validStr: await this.createVaildString(validInfo),
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

  async destroy() {
    const ctx = this.ctx;
    const row = ctx.params;

    const result = await ctx.service.v2.validStrs.destroy(row);
    if (result.affectedRows) {
      ctx.body = null;
      ctx.status = 202;
    } else {
      ctx.body = {
        error: 'NOT IMPLEMENTED',
        detail: { message: '删除失败，未找到对应信息', field: '', code: '' },
      };
      ctx.status = 501;
    }
  }

  // 验证信息是否过期
  async isPastDue(buildDate, periodMinutes) {
    const nowDate = Date.now();
    const passTime = nowDate - buildDate;

    // 已存的时间以分钟为单位，需要手动转换成毫秒
    if (passTime >= periodMinutes * 60 * 1000) {
      return true;
    }
    // 若存在未过期的同类型记录
    return false;
  }
  // 生成验证码
  async createVaildString(validInfo) {
    const sha1 = crypto.createHash('sha1');
    sha1.update(validInfo.indexStr + validInfo.saltStr);
    return sha1.digest('hex');
  }
  // async update() {
  //   const ctx = this.ctx;
  //   const row = JSON.parse(ctx.query.params);
  //   // console.log(row.password);
  //   const result = await ctx.service.v2.validStrs.update(row);

  //   if (result.affectedRows) {
  //     ctx.status = 204;
  //   }
  // }
}

module.exports = ValidStrsController;
