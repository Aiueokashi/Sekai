const mongoose = require("mongoose"),
  config = require("../config"),
  Schema = mongoose.Schema;

module.exports = mongoose.model(
  "Guild",
  new Schema({
    id: { type: String, required: true },

    language: { type: String, default: "en" },

    membersData: { type: Object, default: {} },
    members: { type: [Schema.Types.ObjectId], ref: "Member" },
    prefix: { type: String, default: config.prefix },
    premium: { type: Boolean, default: false },

    plugins: {
      type: Object,
      default: {
        welcome: {
          enabled: false,
          message: null,
          channel: null,
          withImg: false,
        },

        goodbye: {
          enabled: false,
          message: null,
          channel: null,
          withImg: false,
        },
      },
    },

    ignoredChannels: { type: Array, default: [] },
    customCommands: { type: Array, default: [] },
    commands: { type: Array, default: [] },
    disabledCategories: { type: Array, default: [] },
  })
);
