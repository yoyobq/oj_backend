// app/service/v2/testPrograms.js

'use strict';

const Service = require('egg').Service;
const TableName = 'edu_test_programs';

class TestProgramsService extends Service {
  async show(row) {
    const result = await this.app.mysql.get(TableName, row);
    return result;
  }

  async index(params) {
    const result = await this.app.mysql.select(TableName, params);
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

module.exports = TestProgramsService;
