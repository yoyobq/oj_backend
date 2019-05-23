// app/service/v1/authentications.js

'use strict';

const Service = require('egg').Service;
const TableName = 'pf2_authentications';

class AuthenticationsService extends Service {
  async show(row) {
    // 根据用户 id 从数据库获取用户详细信息
    // console.log(row);
    const user = await this.app.mysql.get(TableName, row);
    return user;
  }
  async index(params) {
    let result;
    // console.log(params);
    if (params !== {}) {
      // 此处照理说应当检测mysql服务的处理进程，若有问题及时报错，但是
      // 一、此类错误只会是由于后台编码设计时的失误造成，无需报给前台
      // 二、我不会如何对所有的mysql操作默认给上try，catch，代码里好像很大
      // 因此暂不处理，让egg.js后台直接报告（console.log中会自动记录)

      // authentications资源用于验证账号是否存在，无需返回所有相关信息
      // 一旦找到匹配记录，仅需返回 uuid 和 id 两个字段
      result = await this.app.mysql.select(TableName, {
        where: params,
        columns: [ 'uuid', 'id' ],
      });
    } else {
      result = await this.app.mysql.select(TableName);
    }

    // 此处获取的数据会有几种可能性
    // 1 null 这种情况让controller去处理
    // 2 [{} {} {}],这是最符合期待的结果，index函数展示大量数据
    // 3 [{}]，只取到一个符合条件的数据，此时记得引用的时候要加下标
    return result;
  }

  async create(params) {
    // console.log(params);
    const result = await this.app.mysql.insert(TableName, params);
    return result;
  }

  async update(row) {
    const result = await this.app.mysql.update(TableName, row);
    return result;
  }

  async destroy(params) {
    const result = await this.app.mysql.delete(TableName, params);
    return result;
  }
}

module.exports = AuthenticationsService;
