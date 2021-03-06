const Command = require("../../Structures/Command"),
  axios = require("axios");
const url = "https://srhpyqt94yxb.statuspage.io/api/v2/summary.json";
const components = [
  ["CloudFlare"],
  ["Voice"],
  ["API"],
  ["Tax Calculation Service"],
  ["Gateway"],
  ["Push Notifications"],
  ["Media Proxy"],
  ["Third-party"],
  ["EU West"],
  ["US West"],
  ["EU Central"],
  ["Brazil"],
  ["Singapore"],
  ["Hong Kong"],
  ["Sydney"],
  ["Russia"],
  ["US Central"],
  ["Japan"],
  ["US East"],
  ["South Africa"],
  ["US South"],
];
const { MessageEmbed } = require("discord.js");
const { SekaiEmbed, PaginatedEmbed } = require("../../Structures/Embed");

class Ping extends Command {
  constructor(client) {
    super(client, {
      name: "ping",
      description: "ping",
      usage: "ping",
      example: [],
      args: false,
      category: "General",
      cooldown: 10000,
      aliases: ["π"],
      permLevel: 0,
      guildOnly: true,
    });
  }

  async run(message) {
    const client = this.client;

    const dataEmbed = {
      title: "PONG",
      fields: [
        {
          name: "γγγ",
          value: [
            "```",
            `     ιε»Ά | ${Date.now() - message.createdTimestamp}ms`,
            `WebSocket | ${client.ws.ping}ms `,
            "```",
          ].join("\n"),
        },
      ],
      footer: "β:ε©η¨ε―θ½ | β:ε©η¨δΈε― | ?:γγΌγΏζͺεεΎ",
    };

    try {
      const responce = await axios.get(url);
      const data = responce.data;
      components.forEach((c, i) => {
        const res = data.components.find((x) => x.name === c[0]);
        components[parseInt(i, 10)][1] = res
          ? res.status === "operational"
            ? "β"
            : "β"
          : "?";
      });
      dataEmbed.fields.push(
        {
          name: "γ΅γΌγγΉ",
          value: [
            "```",
            `CloudFlare β ${[components[0][1]]} : ${[
              components[1][1],
            ]} β Voice`,
            `       API β ${[components[2][1]]} : ${[
              components[3][1],
            ]} β Tax Calc`,
            `   Gateway β ${[components[4][1]]} : ${[
              components[5][1],
            ]} β Push Notif`,
            `Med. Proxy β ${[components[6][1]]} : ${[
              components[7][1],
            ]} β Third-party`,
            "```",
          ].join("\n"),
        },
        {
          name: "γ΅γΌγγΌγΉγγΌγΏγΉ",
          value: [
            "```",
            `   EU West β ${[components[8][1]]} : ${[
              components[9][1],
            ]} β US West`,
            `EU Central β ${[components[10][1]]} : ${[
              components[11][1],
            ]} β Brazil`,
            ` Singapore β ${[components[12][1]]} : ${[
              components[13][1],
            ]} β Hong Kong`,
            `    Sydney β ${[components[14][1]]} : ${[
              components[15][1],
            ]} β Russia`,
            `US Central β ${[components[16][1]]} : ${[
              components[17][1],
            ]} β Japan`,
            `   US East β ${[components[18][1]]} : ${[
              components[19][1],
            ]} β South Afr`,
            `  US South β ${[components[20][1]]} :   β `,
            "```",
          ].join("\n"),
        },
        {
          name: "ιε?³",
          value: `\`\`\`${data.incidents ? "γͺγ" : data.incidents}\`\`\``,
        }
      );
    } catch (e) {
      e;
    } finally {
      //console.log(dataEmbed)
      const embed = new MessageEmbed(dataEmbed);
      const info = new MessageEmbed().setTitle("γγγ΅γ");
      const page = new PaginatedEmbed(message.client.user, [embed]);
      page.setInfoPage(info);
      page.run(message.channel);
    }
  }
}

module.exports = Ping;
