const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Biodata = mongoose.model("biodata", {
  biodata: {
    type: String,
    required: true,
  },
  uid: {
    type: Schema.Types.ObjectId,
    required: true,
  },
});

module.exports = { Biodata };
