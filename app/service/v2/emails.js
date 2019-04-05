// app/service/v2/emails.js

'use strict';

const Service = require('egg').Service;
const TableName = 'edu_email';

const nodemailer = require('nodemailer');
const user_email = 'aaa@qq.com';
const auth_code = 'asdfadfadf';

const transporter = nodemailer.createTransport({
  service: 'qq',
  secureConnection: true,
  port: 465,
  auth: {
    user: user_email, // 账号
    pass: auth_code, // 授权码

  },
});

class EmailsService extends Service {
  async show(row) {
    const user = await this.app.mysql.get(TableName, row);
    return user;
  }

  // get 带参数（?xx=00）
  async index(params) {
    const result = await this.app.mysql.select(TableName, {
      where: params,
    });
    // 此处获取的数据会有几种可能性
    // 1 null 这种情况让controller去处理
    // 2 [{} {} {}],这是最符合期待的结果，index函数展示大量数据
    // 3 [{}]，只取到一个符合条件的数据，此时记得引用的时候要加下标
    return result;
  }

  async create(params) {
    // console.log(params);
    // const result = await this.app.mysql.insert(TableName, params);

    const mailOptions = {
      from: user_email, // 发送者,与上面的user一致
      to: params.email, // 接收者,可以同时发送多个,以逗号隔开
      subject: params.subject, // 标题
      text: params.content, // 文本
      // html,
    };

    try {
      await transporter.sendMail(mailOptions);
      return true;
    } catch (err) {
      return false;
    }
    // return result;
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

module.exports = EmailsService;
