// app/service/v2/emails.js

'use strict';

const Service = require('egg').Service;

const nodemailer = require('nodemailer');
const emailPool = [
  {
    user: 'OJ_CSSE_XJTLU@outlook.com',
    pass: 'ec9a7341ec9a734!',
  },
  {
    user: 'yinliwei555@outlook.com',
    pass: 'yinliwei55',
  },
];

class EmailsService extends Service {
  async create(params) {
    const theEmail = Math.floor(Math.random() * emailPool.length);
    const transporter = nodemailer.createTransport({
      service: 'Hotmail',
      // secureConnection: true,
      // port: 465,
      auth: emailPool[theEmail],
      // auth: {
      //   user: 'OJ_CSSE_XJTLU@outlook.com', // 账号
      //   pass: 'ec9a7341ec9a734!', // 授权码
      // },
    });

    const mailOptions = {
      from: emailPool, // 发送者,与上面的user一致
      to: params.email, // 接收者,可以同时发送多个,以逗号隔开
      subject: params.subject, // 标题
      text: params.text, // 文本
      html: params.html,
    };

    try {
      await transporter.sendMail(mailOptions);
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }
}

module.exports = EmailsService;
