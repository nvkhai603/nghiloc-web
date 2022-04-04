const { ObjectId } = require('mongoose');
const  mongoose = require('mongoose');
const directorySchema = mongoose.Schema({
    // Thể lệ
    rule: String,

    // Kết quả
    result: String,

    // Chân trang
    footer: String,

    // Banner
    bannerUrl: String,

    // Main title
    mainTitle: String,

    // Sub title
    subTitle: String,

    // Tên trang Web
    webName: String,

    // Tiêu đề trang web
    webTitle: String,
    tenantId: ObjectId,
    createdAt: {
        type: Date,
        default: Date.now
    },
    deleted:{
        type: Boolean,
        default: false
    },
    deletedAt: {
        type: Date,
        default: null
    }
});

const directoryModel = mongoose.model('Directory', directorySchema);
module.exports = directoryModel;