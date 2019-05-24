// app/v2/controller/createJsFile.js
// 这不是一个RESTful接口，并不操作“资源”，而是用于生成需要的文件，是一个“动作”

// 本页用到了大量的js中fs api，建议参考 http://nodejs.cn/api/fs.html 页面
// 由于 fs api用到了大量的callback函数，造成程序结构会非常难看(callback hell)
// 因此根据需要，尝试在代码不会被经常调用的场景，选择sync(同步)来避免callback(方法1)

// 同时也提供了第二种思路: 把callback包装成Promise接口(方法2）
// 简单的说就是利用util.promisify来封装fs的所有函数(注意require)
// 变成 promise 之后就可以愉快的配合 try/catch 结构使用 async/await 了
// 本页采用了的是方法2,毕竟异步操作不会造成阻塞

// 再提供一种实验性的思路，fsPromise API也已经在node10中提供实验性的使用了
// 也就是不需要转化的方法二，值得关注跟进

'use strict';
const Controller = require('egg').Controller;

const { promisify } = require('util');
const { URL } = require('url');
const fs = require('fs');

// 文件库的根目录位置
const reservePath = 'file:///var/www/oj_reserve/';

class CreateJsFileController extends Controller {
  async create() {
    const ctx = this.ctx;
    const params = ctx.request.body.data;

    if (params.type === undefined) {
      ctx.throw(406, '必须指定需生成的文件类型');
    }
    switch (params.type) {
      case 'testcases': // 从设计上来讲 testcases 只有在前端增添测试用例时才会被用到，较少使用
        await this.createTestcaseFile(params.id);
        break;
      case 'judge': // 用于生成判题文件
        await this.createJudgeFile(params);
        break;
      default: ctx.throw(406, '无效的文件类型');
    }
  }

  async createTestcaseFile(id) {
    const ctx = this.ctx;
    // 注意，这里规定了只有测试用例表中是 status 是 done 的情况才会生成用例及判题文档。
    const row = {
      id,
      status: 'done',
    };
    const result = await ctx.service.v2.testcases.show(row);
    // console.log(result);
    if (result.id === undefined) {
      ctx.throw(400, 'id为' + row.id + '的测试用例正在编辑中或不存在，无法生成测试用例文档。');
    }

    if (result.programLang !== 'js') {
      ctx.throw(406, '这不是一份JavaScript语言的测试用例');
    }

    // 在以 codingQeustions 的 id为名的文件夹中创建符合Js语法可被Js直接调用的测试用例文档 testcase.js
    const dataFileUrl = new URL(reservePath + result.cqId + '/testcases.js');
    // const runFileUrl = new URL(reservePath + testcase.cqId + '/run.js');
    const dirUrl = new URL(reservePath + result.cqId);

    // 检查对应文件夹是否存在，如果不存在则生成文件夹(Sync同步版本)
    // if (!fs.existsSync(dirUrl)) {
    //   await this.createDir(dirUrl);
    // }

    // 检测文件夹是否存在的异步版本
    let isDirExists = false;
    const accessPromise = promisify(fs.access, fs);
    // 找不到文件夹会报错，被catch捕获
    await accessPromise(dirUrl, fs.constants.F_OK).then(function() {
      isDirExists = true;
    }).catch(function() {
      isDirExists = false;
    });

    if (!isDirExists) {
      await this.createDir(dirUrl);
    }

    // 处理 JSON 字符串
    const inputArray = JSON.parse(result.inputData);
    const outputArray = JSON.parse(result.outputData);
    // 利用JSON 值-值 配对的特性，将两个数组按项合并
    const testcaseMap = new Map(
      inputArray.map((item, i) => [ item, outputArray[i] ])
    );
    // console.log(testcaseMap);

    // 再将Map转化为每项为 [ 值1, 值2] 这样的二维数组，
    // 像我这个例子中 值1是本身就是个数组，所以是个三维数组
    // 并用JSON字符串的形式保存
    const testcaseContent = JSON.stringify([ ...testcaseMap ]);
    // console.log(testcaseContent);

    const content = 'const testCases = ' + testcaseContent + '\nmodule.exports = testCases';

    const writeFilePromise = promisify(fs.writeFile, fs);

    await writeFilePromise(dataFileUrl, content).then(function() {
      ctx.status = 201;
    }).catch(function(err) {
      ctx.throw(400, err);
    });
  }

  async createJudgeFile(params) {
    const ctx = this.ctx;
    // console.log(param);
    if (params.cqId === undefined || params.uId === undefined) {
      ctx.throw(406, '必须提供答题人id和编程题id');
    }

    // 安全冗余，检查是否存在这个用户，防止绕过验证作弊的可能
    // 优化运行效率时可取消此检查
    const user = await ctx.service.v2.authentications.show({ id: params.uId });
    if (user === null) {
      ctx.throw(406, '非法的用户id');
    }

    // 需要 codingQuestions 中的 tpId 和 preFuncName
    const quest = await ctx.service.v2.codingQuestions.show({ id: params.cqId });
    if (quest === null) {
      ctx.throw(406, '该编程题不存在');
    }

    if (quest.programLang !== 'js') {
      ctx.throw(406, '这是一道要求用' + quest.programLang + '语言描述的编程题，无法用JavaScript语言来判题');
    }
    if (quest.tpId === null) {
      ctx.throw(406, '与此题相关的判题程序未设定，无法判题，请联系相关教师');
    }

    // 需要 testProgram 中的 testCode， 用于之后的判题文件生成
    const testProgram = await ctx.service.v2.testPrograms.show({ id: quest.tpId, status: 'done' });
    if (testProgram === null) {
      ctx.throw(406, '与此题相关的判题程序未设定或正在编辑中，无法判题，请联系相关教师');
    }
    // 需要 codingRecord 中的 code 拿来判题
    const codingRecord = await ctx.service.v2.codingRecords.show({ uId: params.uId, cqId: params.cqId, status: 'unsolved' });
    if (codingRecord === null) {
      ctx.throw(406, '未在数据库中找到用户提交的代码，无法判题');
    }

    // 拼接出完整的，可以带入testcases并运行的判题文档
    let content = quest.hiddenCode + '\n' +
                  codingRecord.code + '\n' +
                  'let solution = ' + quest.preFuncName + '\n' +
                  'const testCases = require("../' + params.cqId + '/testcases.js")\n' +
                   testProgram.testCode;
    // 替换文档中所有的windows换行(CRLF \r\n)成linux换行(\n)
    content = content.replace(/\r\n/g, '\n');
    // 指定生成文档的名称： oj_reserve/submitCode 目录下，题目Id-用户Id，
    // 例如1号用户做5号题的 javascript（js）题目，则文档名为 oj_reserver/submitCode/5-1.js
    const judgeFileUrl = new URL(reservePath + 'submitCode/' + params.cqId + '-' + params.uId + '.' + testProgram.programLang);

    // 将写文件接口包装成promise接口
    const writeFilePromise = promisify(fs.writeFile, fs);

    await writeFilePromise(judgeFileUrl, content).then(function() {
      ctx.status = 201;
    }).catch(function(err) {
      ctx.throw(400, err);
    });
  }

  // 建立文件夹,使用了前文提到的方法2
  async createDir(dirUrl) {
    const ctx = this.ctx;
    const mkdirPromise = promisify(fs.mkdir, fs);

    try {
      await mkdirPromise(dirUrl); // , function(error) {
    } catch (error) {
      // 啰嗦一句，根据middleware中的相关定义
      // 在生成环境里5xx错误的具体信息是不会传递到前端的（开发环境会）
      // 因此在这里输出服务器敏感性息
      ctx.throw(500, dirUrl + '文件夹生成失败，请检查服务器权限设置');
    }

    // 修改文件所有权(交给特定用户)
    const chownPromise = promisify(fs.chown, fs);
    try {
      await chownPromise(dirUrl, 1000, 1000);
    } catch (error) {
      ctx.throw(500, dirUrl + '文件夹修改权限失败，请检查服务器权限设置');
    }
  }
}
module.exports = CreateJsFileController;
