var router = require("express").Router();
var mongoose = require("mongoose");
var Exam = mongoose.model("Exam");
var UserExam = mongoose.model("UserExam");
var auth = require("../auth");
const multer = require("multer");
const readXlsxFile = require("read-excel-file/node");
const path = require("path");
var Directory = mongoose.model("Directory");
var Tenant = mongoose.model("Tenant");
const fs = require("fs");
var mongoXlsx = require("mongo-xlsx");
const JSZip = require("jszip");

// Lấy question từ sheet
const getQuestionsFromSheet = (rows) => {
  let questions = [];
  // `rows` is an array of rows
  // each row being an array of cells.
  for (let index = 1; index < rows.length; index++) {
    const rowContent = rows[index];
    let newQuestion = {
      content: rowContent[0],
      typeQuestion: "ONE_CHOICE",
      answers: [
        {
          key: "A",
          name: rowContent[1],
        },
        {
          key: "B",
          name: rowContent[2],
        },
        {
          key: "C",
          name: rowContent[3],
        },
        {
          key: "D",
          name: rowContent[4],
        },
      ],
      trueAnswer: rowContent[5],
    };
    questions.push(newQuestion);
  }
  return questions;
};

// Config Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  // reject a file
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png" ||
    file.mimetype ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 10,
  },
  fileFilter: fileFilter,
});

// Active a exam
router.post("/active", auth.require, async (req, res, next) => {
  const { id } = req.body;
  const session = await mongoose.startSession();
  session.startTransaction();
  var exam = await Exam.findOne({
    _id: id,
    isDeleted: false,
    tenantId: req.admin.tenantId,
  });
  if (!exam) {
    await session.abortTransaction();
    return res.status(404).send("Exam not found");
  }

  // Active this exam
  exam.isActive = true;
  await exam.save();

  // Deactive other exam
  var exams = await Exam.find({
    tenantId: req.admin.tenantId,
    isDeleted: false,
    forObject: exam.forObject,
  });
  exams.forEach((element) => {
    if (element._id != id && element.forObject == exam.forObject) {
      element.isActive = false;
      element.save();
    }
  });
  session.commitTransaction();
  return res.status(200).json(exam);
});

router.get("/active", auth.require, async (req, res, next) => {
  var exam = await Exam.findOne({
    tenantId: req.admin.tenantId,
    isDeleted: false,
    isActive: true,
  });
  return res.status(200).json({ exam });
});

// Get all exams
router.get("/", auth.require, async (req, res, next) => {
  var exams = await Exam.find({
    tenantId: req.admin.tenantId,
    isDeleted: false,
  }).sort({ createdAt: -1 });
  var total = exams.length;
  return res.status(200).json({ exams, total });
});

// Get all exams
router.get("/", auth.require, async (req, res, next) => {
  const { page, pageSize, forObject } = req.query;
  var exams = await Exam.find({
    tenantId: req.admin.tenantId,
    isDeleted: false,
    forObject,
  })
    .sort({ createdAt: -1 })
    .skip(page * pageSize)
    .limit(Number.parseInt(pageSize));
  var total = await Exam.find({
    tenantId: req.admin.tenantId,
    isDeleted: false,
    forObject,
  }).countDocuments();
  return res.status(200).json({ exams, total, page, pageSize, forObject });
});

// Create a new exam
router.post(
  "/import",
  auth.require,
  upload.single("exam"),
  async function (req, res, next) {
    if (!req.file.path) {
      return res.status(400).send("File is not valid");
    }
    var exam = new Exam();
    const { name, timeOpen, timeClose, forObject } = req.body;
    exam.questionTeachers = [];
    exam.questionStudents = [];
    exam.name = name;
    exam.timeOpen = timeOpen;
    exam.timeClose = timeClose;
    exam.forObject = forObject;
    exam.isActive = true;
    exam.tenantId = req.admin.tenantId;
    const otherRows = await readXlsxFile(req.file.path, {
      sheet: "QuestionOthers",
    });
    exam.questionTeachers = getQuestionsFromSheet(otherRows);

    const studentRows = await readXlsxFile(req.file.path, {
      sheet: "QuestionStudents",
    });
    exam.questionStudents = getQuestionsFromSheet(studentRows);
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      var oldExams = await Exam.find({
        tenantId: req.admin.tenantId,
        isDeleted: false,
      });
      if (oldExams && oldExams.length > 0) {
        oldExams.forEach(async (element) => {
          element.isActive = false;
          await element.save();
        });
      }
      await fs.unlinkSync(req.file.path);
      await exam.save();
    } catch (error) {
      await session.abortTransaction();
      return res.status(500).send(error);
    }
    session.commitTransaction();
    return res.status(200).json(exam);
  }
);

router.get("/download/template", async (req, res, next) => {
  const file = path.join(
    __dirname,
    "../../public/fileTemplates/ImportExamTemplate.xlsx"
  );
  res.download(file);
});

// 1: Can bo nhan vien, khac
// 2: Hoc sinh
router.get("/export/:examId/:type", auth.require, async (req, res, next) => {
  const type = req.params.type;
  console.log(type);
  if (type != 1 && type != 2) {
    return res.status(400).send("Type is not valid");
  }

  var data;
  if (type == 1) {
    data = await UserExam.find({ examId: req.params.examId, objectType: "TEACHER"});
  }else{{
    data = await UserExam.find({ examId: req.params.examId, objectType: "STUDENT"});
  }}
  /* Generate automatic model for processing (A static model should be used) */
  var model = [
    {
      displayName: "Họ và tên",
      access: "name",
      type: "string",
    },
    {
      displayName: "Số CMND/CCCD",
      access: "identityNumber",
      type: "string",
    },
    {
      displayName: "Số điện thoại",
      access: "phone",
      type: "string",
    },
    {
      displayName: "Đối tượng",
      access: "objectType",
      type: "string",
    },
    {
      displayName: "Đơn vị",
      access: "organization",
      type: "string",
    },
    {
      displayName: "TT bổ sung",
      access: "extraInfor",
      type: "string",
    },
    {
      displayName: "Ngày, tháng, năm sinh",
      access: "dateOfBirth",
      type: "string",
    },
    {
      displayName: "Số câu đúng",
      access: "totalPoint",
      type: "number",
    },
    {
      displayName: "Số dự đoán",
      access: "guessTruePerson",
      type: "number",
    },
    {
      displayName: "Tổng thời gian(s)",
      access: "totalTime",
      type: "number",
    },
  ];
  /* Generate Excel */
  mongoXlsx.mongoData2Xlsx(
    data,
    model,
    { fileName: "Ket_qua_bai_thi.xlsx" },
    function (err, data) {
      console.log("File saved at:", data.fullPath);
      res.download(data.fullPath);
    }
  );
});

router.post(
  "/upload/banner",
  auth.require,
  upload.single("banner"),
  async function (req, res, next) {
    console.log(req.file.filename);
    if (!req.file.path) {
      return res.status(400).send("File is not valid");
    }
    const tenantId = req.admin.tenantId;
    const tenant = await Tenant.findOne({ _id: tenantId });
    if (!tenant) {
      return res.status(404).send("Tenant not found");
    }

    var directory = await Directory.findOne({ tenantId: tenant._id });
    if (!directory) {
      return res.status(400).send("Directory is not valid");
    }

    directory.bannerUrl = "../../uploads/" + req.file.filename;
    await directory.save();
    return res.status(200).json(directory.bannerUrl);
  }
);
module.exports = router;
