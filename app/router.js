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
  router.resources('emails', '/api/v2/emails', controller.v2.emails);
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
