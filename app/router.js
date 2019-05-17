'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  router.resources('authentications', '/api/v2/authentications', controller.v2.authentications);
  router.resources('stuFullInfos', '/api/v2/stuFullInfos', controller.v2.stuFullInfos);
  router.resources('classInfos', '/api/v2/classInfos', controller.v2.classInfos);
  router.resources('permissions', '/api/v2/permissions', controller.v2.permissions);
  router.resources('questionsLibraries', '/api/v2/questionsLibraries', controller.v2.questionsLibraries);
  router.resources('exerciseRecords', '/api/v2/exerciseRecords', controller.v2.exerciseRecords);
  router.resources('questions', '/api/v2/questions', controller.v2.questions);
  router.resources('stuInfos', '/api/v2/stuInfos', controller.v2.stuInfos);
  router.resources('specialities', '/api/v2/specialities', controller.v2.specialities);
  router.resources('departments', '/api/v2/departments', controller.v2.departments);
  router.resources('validStrs', '/api/v2/validStrs', controller.v2.validStrs);
  router.resources('codingQuestions', '/api/v2/codingQuestions', controller.v2.codingQuestions);
  router.resources('codingRecords', '/api/v2/codingRecords', controller.v2.codingRecords);
  router.resources('testcases', '/api/v2/testcases', controller.v2.testcases);

  // eggjs关于restFul的定义比较粗糙，除了文档中提供的以外均需自定义
  // eggjs并没有定义两个关联资源的接口写法，（比如OJ中某用户的所有做题信息）
  // 于是我试着写一个，就有了这条实验性的路由，提供解释如下
  // 1 最终获取的应该是testcases的记录，所以url的最后指向的是testcases
  // 2 url中有 /stuInfos/:uId 作为补充说明，只需要获取某个具体的 uId 对应的 testcases 记录
  // 3 上述查询显然是带条件的查询，应交给index()方法处理
  router.get('testcases', '/api/v2/stuInfos/:uId/testcases', controller.v2.testcases.index);
  // 也可以有如下路由，用于查询所有做过某 cqId 对应题目的用户的完成情况
  router.get('testcases', '/api/v2/codingQuestions/:cqId/testcases', controller.v2.testcases.index);
  // 当然，这种接口设计有点多此一举了，因为完全可以在查询testcases时候，在data中放入uId/cqId信息
  // 而不是专门来做一条路由接口，并修改对应 controller 适配他，所以说这是一条实验性路由

  // emails并不是一个数据库中的“资源”，仅仅借用了REST的语义思想，目前只能create，不知道这种做法是否合适
  // 其实完全可以写成
  // router.post('emails', '/api/v2/emails', controller.v2.emails.create);
  router.resources('emails', '/api/v2/emails', controller.v2.emails);

  // 代码测试
  router.post('codeTest', '/api/v2/codeTest', controller.v2.codeTest.create);

  // 以下是 v1 版本的数据接口，用于小马哥的 TA 系统，作为参考保留
  //                            对象名   路由url         绑定控制器
  // app.router.resources('topics', '/api/v2/topics', app.controller.topics);
  // 由于 const {} = app 的存在应该可以等价于
  // router.resources('authentications', '/api/v1/authentications', controller.v1.authentications);
  // router.resources('questions', '/api/v1/questions', controller.v1.questions);
  // router.resources('examRecords', '/api/v1/examRecords', controller.v1.examRecords);
  // router.resources('accounts', '/api/v1/accounts', controller.v1.accounts);
  // router.resources('informations', '/api/v1/informations', controller.v1.informations);
  // router.resources('modules', '/api/v1/modules', controller.v1.modules);
  // router.resources('moduleApplyRecords', '/api/v1/moduleApplyRecords', controller.v1.moduleApplyRecords);
  // router.resources('examLists', '/api/v1/classes/:classId/examLists', controller.v1.examLists);
  // router.resources('scoreLists', '/api/v1/accounts/:uid/scoreLists', controller.v1.scoreLists);

  // 也就是说允许殊途同归的路由，待议
  // router.resources('scores', '/api/v1/accounts/:uid/scores', controller.v1.scores);
  // router.get('scores', '/api/v1/scores/wrong', controller.v1.scores.wrong);

  // 有意思的问题，下面这个路由，由于匹配上面那条 /api/v1/examRecords 会给自动拦截掉
  // 好像也没啥好的解决方案，只能把count写到 index的 params里面去了
  // router.get('/api/v1/examRecords/count', controller.v1.examRecords.count);

  // router.resources('users', '/api/v1/users', controller.v1.users);
  // router.resources('users', '/api/v1/appointLists', controller.v1.appointLists);
  // router.resources('tests', '/api/v1/scoreLists/:id/password', controller.v1.password);

  // 以下这个例子描述了两件事
  // 中间件可以放在变量里
  // const validate = app.middleware.validateHandler();
  // 路由格式 router.verb('router-name', 'path-match', middleware1, ..., middlewareN, app.controller.action);
  // app.router.resources('/v2', validate, controller.v1.authentications);

  // 早期的一些测试链接，已无用，相关文件已删除，莫取消注释
  // router.get('/', validate);
  // router.get('/', controller.home.index);
  // router.get('/user/:id', controller.user.info);
};
