const { MessageEmbed } = require("discord.js");

module.exports = class SekaiEmbed extends MessageEmbed {
  constructor(userData, data = {}, category = null) {
    super(data);
    this.setColor(userData.color).setTimestamp();
  }

  setDescriptionFromBlockArray(blocks) {
    this.description = blocks
      .map((lines) => lines.filter((l) => !!l).join("\n"))
      .filter((b) => !!b.length)
      .join("\n\n");
    return this;
  }
};
