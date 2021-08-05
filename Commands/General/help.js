const Command = require("../../Structures/Command");
const { SekaiEmbed, PaginatedEmbed } = require("../../Structures/Embed");

class Help extends Command {
  constructor(client) {
    super(client, {
      name: "help",
      description: "help",
      usage: "help",
      example: [],
      args: false,
      category: "General",
      cooldown: 0,
      aliases: [],
      permLevel: 0,
      guildOnly: true,
    });
  }

  async run(message, [...args], data) {
    const client = this.client;
    if (args[0]) {
      const COMMAND = client.commands.get(args[0]);
      if (!COMMAND || COMMAND.ownerOnly) {
        return super.respond(
          "Could not find that command :`" + args[0] + "`"
        );
      } else {
        let PERMS = [];
        if (COMMAND.userPermsNotBit.length > 0) {
          COMMAND.userPermsNotBit.forEach((p) =>
            PERMS.push(message.member.hasPermission(p) ? `✅${p}` : `❎${p}`)
          );
          let help_embed = new AmaneEmbed(data.userData)
            .setTitle(`${COMMAND.name} | category:${COMMAND.category}`)
            .setDescription(
              COMMAND.description.replace(/<<p>>/gm, message.guild.prefix)
            )
            .addField("arguments", COMMAND.args ? "✅" : "❎")
            .addField(
              "example",
              `\`\`\`${
                (COMMAND.example &&
                  COMMAND.example
                    .map((x) => `${data.guildData.prefix}${COMMAND.name} ${x}`)
                    .join("\n")) ||
                "no examples"
              }\`\`\``
            )
            .addField(`premissions`, PERMS)
            .addField("status", COMMAND.disable ? "under maintenance" : "available");
          super.respond(help_embed);
        }
      }
    } else {
      const COMMANDS = client.commands.array();
      const Embed_Array = new Array();

      function* getPage(pageSize = 1, list) {
        let output = [];
        let index = 0;
        let outputIndex = 0;
        while (index < list.length) {
          output = [];
          for (let i = index; i < index + pageSize; i++) {
            if (list[i]) {
              output.push(list[i]);
            }
          }
          index += pageSize;
          outputIndex++;
          yield [outputIndex, output];
        }
      }
      var page = getPage(10, COMMANDS);

      for (const value of page) {
        let help_embed = new SekaiEmbed(data.userData).setTitle(
          `${client.user.tag} | HELP`
        );
        value[1].forEach((v) => {
          v.ownerOnly
            ? null
            : help_embed.addField(
                `**${message.guild.prefix}${v.name} ${
                  v.aliases.length === 0 ? "" : ` | (${v.aliases})`
                }**`,
                `${v.description.replace(/<<p>>/gm, message.guild.prefix)}\n(${
                  v.disable === false ? "available" : "under maintenance"
                })`,
                true
              );
        });
        help_embed.setTimestamp();
        Embed_Array.push(help_embed);
      }

      const embed = new PaginatedEmbed(message.author, Embed_Array);
      embed.run(message.channel);
    }
  }
}

module.exports = Help;
