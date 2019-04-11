// app/service/v2/validStrs.js

'use strict';

const crypto = require('crypto');
const Service = require('egg').Service;
const TableName = 'edu_valid_strs';

class ValidStrsService extends Service {
  async show(row) {
    const result = await this.app.mysql.get(TableName, row);
    const vaildStr = await this.createVaildString(result);

    // 不返回查询到的数据，直接返回验证字符串
    return vaildStr;
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

    result.vaildStr = await this.createVaildString(params);

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

  // 生成验证码
  async createVaildString(validInfo) {
    const sha1 = crypto.createHash('sha1');
    sha1.update(validInfo.indexStr + validInfo.saltStr);
    return sha1.digest('hex');
  }
}

module.exports = ValidStrsService;
