const { ObjectId } = require("mongoose");
const mongoose = require("mongoose");
const directorySchema = mongoose.Schema({
  students: [
    {
      value: String,
      sort: Number,
    },
  ],
  teachers: [
    {
      value: String,
      sort: Number,
    },
  ],
  tenantId: ObjectId,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  deleted: {
    type: Boolean,
    default: false,
  },
  deletedAt: {
    type: Date,
    default: null,
  },
});

const directoryModel = mongoose.model("Organization", directorySchema);
module.exports = directoryModel;
