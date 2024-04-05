const { ObjectId, Number } = require("mongoose");
const mongoose = require("mongoose");
const examSchema = mongoose.Schema({
  name: String,
  timeOpen: Date,
  timeClose: Date,
  tenantId: ObjectId,
  organizations: String,
  objectives: String,
  isActive: {
    type: Boolean,
    default: false,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  deletedAt: Date,
  questionStudents: [
    {
      content: String,
      trueAnswer: Object,
      typeQuestion: {
        type: String,
        enum: ["MORE_CHOICE", "ONE_CHOICE", "FREE_TEXT"],
        default: "ONE_CHOICE",
      },
      answers: [
        {
          key: String,
          name: String,
        },
      ],
    },
  ],
  questionTeachers: [
    {
      content: String,
      trueAnswer: Object,
      typeQuestion: {
        type: String,
        enum: ["MORE_CHOICE", "ONE_CHOICE", "FREE_TEXT"],
        default: "ONE_CHOICE",
      },
      answers: [
        {
          key: String,
          name: String,
        },
      ],
    },
  ],
  // Số câu hỏi random lấy ra
  totalRandomQuestion: Number,
  createdAt: {
    type: Date,
    dafault: new Date(),
  },
});

const examModel = mongoose.model("Exam", examSchema);
module.exports = examModel;
