// app/service/v2/codingRecords.js

'use strict';

const Service = require('egg').Service;
const TableName = 'edu_coding_records';

class CodingRecordsService extends Service {
  async show(row) {
    const result = await this.app.mysql.get(TableName, row);
    return result;
  }

  async index(params) {
    const result = await this.app.mysql.select(TableName, params);
    // where: params,
    // columns: [ '证件号码', '学号', '姓名', '性别', '所在年级', '所在学部', '所在专业', '所在班级', '是否在籍', '是否在校', '是否住宿', '是否下厂实习', '入学层次' ],
    // orders: [['created_at','desc'], ['id','desc']],
    // limit: 10,
    // offset: 0  // 偏移量从第n个数据开始地区
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

  async destroy(row) {
    const result = await this.app.mysql.delete(TableName, row);
    return result;
  }
}

module.exports = CodingRecordsService;
