const { ObjectId } = require('mongoose');
const  mongoose = require('mongoose');
const userExamSchema = mongoose.Schema({
    // Tên
    name: String,

    // Số chứng minh thư
    identityNumber: String,

    // Số điện thoại
    phone: String,

    // Đơn vị, trường học
    organization: String,

    // Loại đối tượng
    objectType: {
        type: String
    },

    // Phòng ban, khối xóm của CNVC, Nhân dân
    organizationUnit: String,
    // Lớp của học sinh
    createdAt: Date,

    // Thời gian bắt đâu thi
    timeStart: Date,

    // Thời gian kết thúc thi
    timeEnd: Date,

    // Tổng thời gian thi
    totalTime: String,

    totalPoint: Number,

    // Key thi
    transactionKey: ObjectId,

    // Dự đoán số người thi đúng
    guessTruePerson: Number,

    // Thông tin bổ sung
    extraInfor: String,

    // Id bài thi
    examId: ObjectId,

    // Id tenant
    tenantId: ObjectId,

    // Ngày sinh
    dateOfBirth: String,
    
    createdAt: {
        type: Date,
        default: new Date
    }
});

const userExamModel = mongoose.model('UserExam', userExamSchema);
module.exports = userExamModel;