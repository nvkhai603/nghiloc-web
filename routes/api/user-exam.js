var router = require("express").Router();
var mongoose = require("mongoose");
var Exam = mongoose.model("Exam");
var UserExam = mongoose.model("UserExam");
var ExamTransaction = mongoose.model("ExamTransaction");
var Tenant = mongoose.model("Tenant");
var auth = require("../auth");

// Tính điểm
const caclPoint = function (type, exam, answers) {
  if (type == "STUDENT") {
    if (exam.questionStudents.length == 0) {
      return 0;
    }
    let point = 0;
    for (let index = 0; index < exam.questionStudents.length; index++) {
      let question = exam.questionStudents[index];
      let answer = answers.find((x) => x.questionId == question._id);
      if (
        answer &&
        answer.key &&
        answer.key.toLowerCase() == question.trueAnswer.toLowerCase()
      ) {
        point += 1;
      }
    }
    return point;
  } else {
    if (exam.questionTeachers.length == 0) {
      return 0;
    }
    let point = 0;
    for (let index = 0; index < exam.questionTeachers.length; index++) {
      let question = exam.questionTeachers[index];
      let answer = answers.find((x) => x.questionId == question._id);
      if (
        answer &&
        answer.key &&
        answer.key.toLowerCase() == question.trueAnswer.toLowerCase()
      ) {
        point += 1;
      }
    }
    return point;
  }
};

// Get exam active
router.get("/exams/active", async (req, res, next) => {
  const tenantCode = req.headers["x-tenant-code"];
  var tenant = await Tenant.findOne({ code: tenantCode });
  if (!tenant) {
    return res.status(404).send("Tenant not found");
  }
  var exams = await Exam.find({
    tenantId: tenant._id,
    isDeleted: false,
    isActive: true,
  }).sort({ createdAt: -1 });
  var total = exams.length;
  var examRes = [];
  exams.forEach(async (exam) => {
    // Disable questions
    exam.questions = undefined;
    examRes.push(exam);
  });
  return res.status(200).json({ examRes, total });
});

// Create transactionKey
router.post("/transaction", auth.getTenantId, async (req, res, next) => {
  var tenant = await Tenant.findOne({ _id: req.reqTenantId });
  if (!tenant) {
    return res.status(404).send("Tenant not found");
  }
  const input = req.body;
  if (!input) {
    return res.status(400).send("Input invalid");
  }
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    var userExam = new UserExam();
    userExam.name = input.name;
    userExam.identityNumber = input.identityNumber;
    userExam.phone = input.phone;
    userExam.organization = input.organization;
    userExam.objectType = input.forObject;
    userExam.organizationUnit = input.organizationUnit;
    userExam.examId = input.examId;
    userExam.tenantId = input.tenantId;
    userExam.extraInfor = input.extraInfor;
    userExam.dateOfBirth = input.dateOfBirth;

    var examTransaction = new ExamTransaction();
    examTransaction.examId = userExam.userTransactionId;
    examTransaction.examId = input.examId;
    examTransaction.forObject = input.forObject;
    examTransaction.tenantId = tenant._id;
    examTransaction.timeStart = new Date();
    userExam.transactionKey = examTransaction._id;
    await examTransaction.save();
    await userExam.save();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  }
  session.commitTransaction();
  return res.status(200).jsonp(examTransaction);
});

// Submit exam
router.post("/submit", async (req, res, next) => {
  const timeEnd = Date.now();
  const { transactionKey, answers, guessTruePerson } = req.body;
  console.log(req.body);
  if (!Number.isInteger(guessTruePerson)) {
    return res.status(400).send("Guess true person invalid");
  }

  if (!transactionKey || !answers) {
    return res.status(400).send("Input invalid");
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  var examTransaction = await ExamTransaction.findOne({ _id: transactionKey });
  if (!examTransaction) {
    return res.status(400).send("Exam transaction not found");
  }

  // Tính toán điểm
  var exam = await Exam.findOne({ _id: examTransaction.examId });
  if (!exam) {
    return res.status(404).send("Exam not found");
  }

  // answers = [{questionId: 1, key: "A"}, {questionId: 2, key: "B"}]
  var totalPoint = caclPoint(examTransaction.forObject, exam, answers);

  // Cập nhật điểm

  var userExam = await UserExam.findOne({ transactionKey: transactionKey });
  if (!userExam) {
    return res.status(404).send("User exam not found");
  }

  userExam.totalPoint = totalPoint;
  userExam.guessTruePerson = guessTruePerson;
  userExam.timeStart = examTransaction.timeStart;
  userExam.timeEnd = timeEnd;
  userExam.totalTime = (
    (timeEnd - examTransaction.timeStart.getTime()) /
    1000
  ).toFixed(0);

  await userExam.save();
  // await examTransaction.remove();
  session.commitTransaction();

  return res.status(200).json({ transactionKey, userExam });
});

// Get user exam by exam id
// Admin
router.get("/exams/:examId/student", auth.require, async (req, res, next) => {
  const { examId } = req.params;
  var userExams = await UserExam.find({ examId, objectType: "STUDENT" });
  return res.status(200).json(userExams);
});

// Get user exam by exam id
// Admin
router.get("/exams/:examId/teacher", auth.require, async (req, res, next) => {
  const { examId } = req.params;
  const tenantId = req.admin.tenantId;
  var userExams = await UserExam.find({
    examId: examId,
    objectType: "TEACHER",
  });
  return res.status(200).json(userExams);
});
module.exports = router;
