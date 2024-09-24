const mongoose = require("mongoose");

const DocumentSchema = new mongoose.Schema({
  id: String,
  data: mongoose.Schema.Types.Mixed,
});

module.exports = mongoose.model("Document", DocumentSchema);
