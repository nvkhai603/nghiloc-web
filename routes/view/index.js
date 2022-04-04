var router = require("express").Router();
var mongoose = require("mongoose");
var Directory = mongoose.model("Directory");
var ExamTransaction = mongoose.model("ExamTransaction");
var Exam = mongoose.model("Exam");
var shuffle = require('shuffle-array');

router.get("/", async function (req, res, next) {
  console.log(12);
  res.locals.directories = await Directory.findOne({
    tenantId: "623f2814e2bf65460c67547b",
  });
  res.locals.isShowExamButton = true;
  return res.render("home", { title: "Express" });
});

router.get("/tham-gia-bai-thi", async function (req, res, next) {
  res.locals.directories = await Directory.findOne({
    tenantId: "623f2814e2bf65460c67547b",
  });
  const exam = await Exam.findOne({tenantId: "623f2814e2bf65460c67547b", isActive: true});
  if (!exam) {
    res.locals.isExamStarted = false;
    res.locals.isShowExamButton = false;
    return res.render("exam", { title: "Express" });
  }
  
  console.log("OpenTime", Date.parse(exam.timeOpen));
  console.log("CloseTime", Date.parse(exam.timeClose));
  const timeNow = Date.now();
  console.log("Now", timeNow);

  if (Date.parse(exam.timeOpen) <= timeNow && Date.parse(exam.timeClose) >= timeNow) {
    res.locals.isExamStarted = true;
    res.locals.isShowExamButton = false;
    res.locals.examId = exam._id;
    return res.render("exam", { title: "Express" });
  }

  res.locals.isExamStarted = false;
  res.locals.isShowExamButton = false;
  return res.render("exam", { title: "Express" });
});

// id=${data.examId}&transaction=${data._id}&type=${data.forObject}
router.get("/lam-bai-thi", async function (req, res, next) {
  const { id, transaction, type } = req.query;
  res.locals.isValidTransaction = false;
  res.locals.directories = await Directory.findOne({
    tenantId: "623f2814e2bf65460c67547b",
  });
  res.locals.isShowExamButton = false;

  if (!id || !transaction || !type) {
    return res.render("do-exam");
  }

  var examTransaction = await ExamTransaction.findOne({ _id: transaction });
  if (!examTransaction) {
    return res.render("do-exam");
  }

  if (examTransaction.forObject.toLowerCase() != type.toLowerCase()) {
    return res.render("do-exam");
  }

  var exam = await Exam.findOne({ _id: id });
  if (!exam) {
    return res.render("do-exam");
  }

  res.locals.isValidTransaction = true;
  res.locals.transactionKey = transaction;
  if (type.toLowerCase() == "student") {
    res.locals.exam = {
        name: exam.name,
        tenantId: exam.tenantId,
        questions: shuffle.pick(exam.questionStudents, {'picks': 14}),
    };
  } else {
    res.locals.exam = {
        name: exam.name,
        tenantId: exam.tenantId,
        questions: shuffle.pick(exam.questionTeachers, {'picks': 14}),
    };
  }
  return res.render("do-exam");
});

module.exports = router;
