// app/service/v2/validStrs.js

'use strict';

const crypto = require('crypto');
const Service = require('egg').Service;
const TableName = 'edu_valid_strs';

class ValidStrsService extends Service {
  async show(row) {
    const user = await this.app.mysql.get(TableName, row);
    return user;
  }

  // get 带参数（?xx=00）
  async index(params) {
    const result = await this.app.mysql.select(TableName, {
      where: params,
    });

    // console.log(result);
    // 此处获取的数据会有几种可能性
    // 1 null 这种情况让controller去处理
    // 2 [{} {} {}],这是最符合期待的结果，index函数展示大量数据
    // 3 [{}]，只取到一个符合条件的数据，此时记得引用的时候要加下标
    return result;
  }

  async create(params) {
    // 生成随机4位字符串（数字与英文字符）
    params.saltStr = Math.random().toString(36).substr(2, 4);
    const result = await this.app.mysql.insert(TableName, params);

    // 生成验证码
    const sha1 = crypto.createHash('sha1');
    sha1.update(params.indexStr + params.saltStr);
    result.vaildStr = sha1.digest('hex');

    return result;
  }

  // async update(row) {
  //   const result = await this.app.mysql.update(TableName, row);
  //   return result;
  // }

  // async destroy(params) {
  //   const result = await this.app.mysql.delete(TableName, params);
  //   return result;
  // }
}

module.exports = ValidStrsService;
