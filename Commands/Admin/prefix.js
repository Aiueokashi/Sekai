const Command = require("../../Structures/Command"),
  { SekaiEmbed } = require("../../Structures/Embed");

class Prefix extends Command {
  constructor(client) {
    super(client, {
      name: "sekaiprefix",
      aliases: [],
      description: "",
      usage: "sekaiprefix <string>",
      example: ["sv!", "$"],
      args: true,
      category: "Admin",
      cooldown: 100000,
      userPerms: ["ADMINISTRATOR"],
      permLevel: 9,
      ownerOnly: false,
    });
  }

  async run(message, [prefix, ...args], data) {
    if (prefix.length > 2) {
      return super.respond("prefixは3文字未満にしてください。");
    }
    const client = this.client;
    const guild = client.findOrCreateGuild({ id: message.guild.id });
    const oldPrefix = guild.prefix;

    guild.prefix = prefix;
    await guild.save();
    let prefix_embed = new SekaiEmbed(data.userData)
      .setTitle("prefixchanged")
      .addField("befor", oldPrefix)
      .addField("after", prefix)
      .setTimestamp();

    super.respond(prefix_embed);
  }
}

module.exports = Prefix;
