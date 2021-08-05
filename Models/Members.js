const mongoose = require("mongoose");

module.exports = mongoose.model(
  "Member",
  new mongoose.Schema({
    id: { type: String },
    guildID: { type: String },

    registeredAt: { type: Number, default: Date.now() },

    voice: {
      type: Object,
      default: {
        channel: null,
        joining: false,
        joinedtimestamp: 0,
        total: 0,
      },
    },
  })
);
