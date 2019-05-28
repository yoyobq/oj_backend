// app/service/v2/count.js

'use strict';

const Service = require('egg').Service;

class CountService extends Service {
  // get 带参数（?xx=00）
  async count(tableName, params) {
    // console.log(resources);
    const result = await this.app.mysql.count(tableName, params);
    return result;
  }

  async fastCount(tableName) {
    // mysql-escaped 防止注入
    const sql = 'explain select * from ' + this.app.mysql.escapeId(tableName);
    // 注意是个数组
    const result = await this.app.mysql.query(sql);
    return result[0].rows;
  }
}

module.exports = CountService;
