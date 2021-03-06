// app/service/v1/examRecords.js

'use strict';

const Service = require('egg').Service;
const TableName = 'pf2_exam_records';

class ExamRecordsService extends Service {
  async show(uid) {
    // 根据用户 id 从数据库获取用户详细信息
    const user = await this.app.mysql.get(TableName, { acc_Id: uid });
    return user;
  }
  async index(params) {
    let result;
    if (params !== {}) {
      result = await this.app.mysql.select(TableName, {
        where: params,
      });
    } else {
      result = await this.app.mysql.select(TableName);
    }
    return result;
  }
  async create(params) {
    // examId: '6', id: '1', gid: '6', num: '100', score: '1',
    const sqlStr = 'INSERT INTO `pf2_exam_records`(`que_Id`,`queG_Id`,`exam_Id`,`exam_RealAnswer`,`id`) SELECT `quest_Id`,`queG_Id`, ?,`quest_Answer`,? FROM `pf2_questions` WHERE queG_id = ? AND queS_id > 0 ORDER BY RAND() LIMIT ?';
    // 注意数据类型造成的错误
    // console.log(typeof params.num);
    const result = await this.app.mysql.query(sqlStr, [ params.examId, params.id, params.gid, parseInt(params.num) ]);
    return result;
  }

  async update(params) {
    const row = {
      exam_stuAnswer: params.stuAnswer,
    };
    const options = {
      where: {
        record_id: params.record_id,
      },
    };
    // console.log(row.record_id);
    const result = await this.app.mysql.update(TableName, row, options);
    return result;
  }
}

module.exports = ExamRecordsService;
