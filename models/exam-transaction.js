const { ObjectId } = require('mongoose');
const  mongoose = require('mongoose');
const examTransactionSchema = mongoose.Schema({
    timeStart: {
        type: Date,
        default: Date.now
    },

    forObject: {
        type: String
    },

    userTransactionId: ObjectId,
    
    // Id bài thi
    examId: ObjectId,

    // Id tenant
    tenantId: ObjectId
});

const examTransactionModel = mongoose.model('ExamTransaction', examTransactionSchema);
module.exports = examTransactionModel;