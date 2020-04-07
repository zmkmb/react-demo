const Base = require('./base.js');

module.exports = class extends Base {
    // constructor(){
    //     super();
    // }


    /* 默认 */
    async listAction() {

        let { key } = await this.post();
        let keyObj = { 'tab1': 1, 'tab2': 2, 'tab3': 3, 'tab4': 4 };
        let tag_id = keyObj[key];

        if (!tag_id) {
            return this.body = this.response({ list: [] })
        }

        let videoModel = think.model('video');
        let tagModel = think.model('video_tag');
        let relationModel = think.model('relation');
        let data, tagArr, list = {};
        tagArr = await relationModel.select({ field: 'DISTINCT tag_id' });

        if (tag_id == 1) {
            for (let i = 0; i < tagArr.length; i++) {
                data = await relationModel.
                    join('video ON video.id = relation.video_id')
                    .join('video_tag ON relation.tag_id = video_tag.id')
                    .where({ tag_id: tagArr[i].tag_id })
                    .limit(0, 9)
                    .select({ field: 'video.id,name,img,m3u8_url,tag_id,tag' });
                list[data[0].tag] = data;
            }

        } else {
            data = await relationModel.join('video ON video.id = relation.video_id').where({ tag_id: tag_id }).select({ field: 'id,name,img,m3u8_url,tag_id' });
            tagArr = await tagModel.where({ id: tag_id }).find();
            if (!think.isEmpty(data)) {
                list[tagArr['tag']] = data;
            }
        }

        this.body = this.response({ list: list });
    }


    /* 热门视频 */
    async hotListAction() {
        let { key } = await this.post();
        let keyObj = { 'tab1': 1, 'tab2': 2, 'tab3': 3, 'tab4': 4 };
        let tag_id = keyObj[key];

        if (!tag_id) {
            return this.body = this.response({ list: [] })
        }



        let relationModel = think.model('relation');
        let data = await relationModel.join('video ON video.id = relation.video_id').join('video_status ON video_status.video_id = relation.video_id').where({ tag_id: tag_id }).order('`like` DESC').limit(0, 6).select({ field: 'id,name,img,m3u8_url,tag_id' });
        if (!think.isEmpty(data)) {
            let list = [];
            list = data;
            this.body = this.response({ list: list });
        }
    }

    /* 获取视频评论 */
    async getCommentAction() {
        let { video_id, page } = await this.post();
        let videoModel = think.model('video_comment');

        let data = await videoModel.join('user ON video_comment.user_id=user.id').where({ user_id: this.userId, video_id: video_id }).page(page, 10).order('create_time DESC').select();
        if (!think.isEmpty(data)) {
            this.body = this.response({ list: data })
        }
    }

    /* 获取视频状态 */
    async videoStatusAction() {

        let { video_id } = await this.post();
        let videoModel = think.model('video_status');

        let data = await videoModel.where({ user_id: this.userId, video_id: video_id }).find();
        if (!think.isEmpty(data)) {
            this.body = this.response(data)
        }
    }


    /* 获取关注视频 */
    async collectAction() {
        //判断登录
        let response = await this.checkLogin();
        if (!response.result) {
            return this.body;
        }
        let { page } = await this.post();
        let videoModel = think.model('video_status');
        let data = await videoModel.join('video on video.id = video_status.video_id').where({ user_id: this.userId, star: 1}).page(page, 10).select();
        console.log(data)
        if (!think.isEmpty(data)) {
            this.body = this.response({ list: data })
        }
    }



    /* 添加视频评论 */
    async addCommentAction() {

        //判断登录
        let response = await this.checkLogin();
        if (!response.result) {
            return this.body;
        }
        let { video_id, comment } = await this.post();
        let user_id = this.userId;
        let videoModel = think.model('video_comment');
        let data = await videoModel.add({ user_id, video_id, comment, create_time: parseInt(new Date().valueOf() / 1000) });
        if (!think.isEmpty(data)) {
            this.body = this.response(data)
        }
    }

    /* 更新视频 */
    async updateAction() {

        //判断登录
        let response = await this.checkLogin();
        if (!response.result) {
            return this.body;
        }

        let { like, dislike, star, share, video_id } = await this.post();

        let videoModel = think.model('video_status');
        let data = await videoModel.where({ video_id: video_id, user_id: this.userId }).find();
        if (think.isEmpty(data)) {
            let insertId = await videoModel.add({ like, dislike, star, share, video_id, user_id: this.userId });
        } else {
            data = await videoModel.where({ video_id: video_id, user_id: this.userId }).update({ like, dislike, star, share });
        }

        if (!think.isEmpty(data)) {
            this.body = this.response(data);
        }
    }


};
