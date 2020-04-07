const Base = require('./base.js');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const rename = think.promisify(fs.rename, fs);
module.exports = class extends Base {
    // constructor(){
    //     super();
    // }

    /* 默认 */
    async indexAction() {
        this.checkLogin()
        const userId = await this.session('userId');
        this.body = JSON.stringify(this.get()) + JSON.stringify(userId);
    }

    /* 登录 */
    async loginAction() {
        let userModel = this.model('user');
        let { mobile, password, code } = this.ctx.post();
        let userInfo = await userModel.where({ mobile, password }).find();
        if (!think.isEmpty(userInfo)) {
            let token = jwt.sign({ 'userId': userInfo.id }, 'shhhhh');
            this.header('authtoken', token);
            userInfo.avatar = 'http://192.168.124.66:8360' + userInfo.avatar;
            this.body = this.response(userInfo);
        } else {
            this.body = this.response([], '账号密码不正确');
        }

    }

    /* 退出登录 */
    logoutAction() {

    }

    async updateNameAction() {
        //判断登录
        let response = await this.checkLogin();
        if (!response.result) {
            return this.body;
        }

        let username = this.post('username');
        let userModel = this.model('user');
        let res = await userModel.where({ id: this.userId }).update({ username: username});
        if (res) {
            let userInfo = await userModel.where({ id: this.userId }).find();
            userInfo.avatar = 'http://192.168.124.66:8360' + userInfo.avatar;
            this.body = this.response(userInfo);
        }
    }


    /* 上传头像 */
    async uploadHeadImgAction() {
        //判断登录
        let response = await this.checkLogin();
        if (!response.result) {
            return this.body;
        }
        let file = this.file('files');
        const filepath = path.join(think.ROOT_PATH, 'www/static/upload/' + file.name);
        think.mkdir(path.dirname(filepath));
        await rename(file.path, filepath);
        let userModel = this.model('user');

        let res = await userModel.where({ id: this.userId }).update({ avatar: '/static/upload/' + file.name });
        if (res) {
            let userInfo = await userModel.where({ id: this.userId }).find();
            userInfo.avatar = 'http://192.168.124.66:8360' + userInfo.avatar;
            this.body = this.response(userInfo);
        }
    }

    /* 用户注册 */
    async registerAction() {
        let userModel = this.model('user');
        let { mobile, password, code } = this.ctx.post();
        console.log(mobile)
        let userInfo = await userModel.where({ mobile }).select();

        if (think.isEmpty(userInfo)) {
            let insertId = await userModel.add({ mobile, password, salt: code, status: 1, username: '', avatar: '', register_time: parseInt(new Date().valueOf() / 1000) });
            //this.loginAction()
            this.body = this.response(insertId);
        } else {
            this.body = this.response([], '手机号已存在');
        }
    }
};
