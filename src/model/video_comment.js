module.exports = class extends think.Model {
  getList() {
    return this.join('user ON video_comment.user_id=user.id').select();
  }
}