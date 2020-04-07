const jwt = require('jsonwebtoken');

module.exports = class extends think.Controller {
  async __before() {
    this.userId = 0
    let token = await this.header('authtoken');
    if (token) {
      var decoded = jwt.verify(token, 'shhhhh');
      this.userId = decoded['userId'];
    }
  }

  authFail() {
    return this.fail('JWT 验证失败');
  }

  async checkLogin() {
    let token = await this.header('authtoken');
    if (token) {
      var decoded = jwt.verify(token, 'shhhhh');
      this.userId = decoded['userId'];
      return { result: true, code: 'login' };
    }
    this.body = this.response([], '登录失败', 11);
    return { result: false, code: 'logout' };
  }

  //输出
  response(data = [], error = '', code = 1, result = true) {
    if (error) {
      result = false;
    }
    return JSON.stringify({ data, code, result, error });
  }
};
