// app/service/v2/createFile.js

'use strict';

const Service = require('egg').Service;


class CreateFileService extends Service {
  async create(params) {
    console.log(params);
    // const result = await this.app.mysql.insert(TableName, params);
    return 1;
  }
}

module.exports = CreateFileService;
