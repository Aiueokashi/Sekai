const { Structures } = require("discord.js"),
  mongoose = require("mongoose");

//Guildクラス拡張
Structures.extend(
  "Guild",
  (Guild) =>
    class extends Guild {
      constructor(client, data) {
        super(client, data);
      }
    }
);
