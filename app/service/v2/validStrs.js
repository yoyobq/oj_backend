// app/service/v2/validStrs.js

'use strict';

const Service = require('egg').Service;
const TableName = 'edu_valid_strs';

class ValidStrsService extends Service {
  async show(row) {
    const result = await this.app.mysql.get(TableName, row);
    return result;
  }

  // get 带参数（?xx=00）
  async index(params) {
    const result = await this.app.mysql.select(TableName, {
      where: params,
    });

    return result;
  }

  async create(params) {
    // 生成随机4位字符串（数字与英文字符）
    params.saltStr = Math.random().toString(36).substr(2, 4);
    const result = await this.app.mysql.insert(TableName, params);

    return result;
  }

  // async update(row) {
  //   const result = await this.app.mysql.update(TableName, row);
  //   return result;
  // }

  async destroy(params) {
    const result = await this.app.mysql.delete(TableName, params);
    return result;
  }
}

module.exports = ValidStrsService;
