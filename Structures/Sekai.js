const { Client, Collection, Intents } = require("discord.js"),
  chalk = require("chalk"),
  path = require("path"),
  fs = require("fs"),
  glob = require("glob"),
  COMMAND = require("./Command"),
  git = require("simple-git"),
  SekaiError = require("./Extender/Error"),
  { MONGO_URL, TOKEN, DEV_API_URL } = process.env,
  axios = require("axios"),
  mongoose = require("mongoose"),
  Constants = require("./Utils/Constants"),
  Util = require("./Utils/Util");

require("./Extender/Console");
require("./App/KeepAlive");
require("./Extender/Guild");

class Sekai extends Client {
  constructor() {
    super({
      partial : ["GUILD_MEMBER", "USER"],
      intents : [Intents.ALL]
    });
    this.slcUtil = {
      url: `https://discord.com/api/v8/applications/${process.env.CLIENT_ID}/commands`,
      header: {
        headers: {
          Authorization: "Bot " + process.env.TOKEN,
          "Content-Type": "application/json",
        },
      },
    };

    this.config = require("../config");
    /* Collection<name, command> */
    this.commands = new Collection();
    /* Collection<name, slashCommand>*/
    this.slashCommands = new Collection();
    /* Collection<alias, name> */
    this.aliases = new Collection();
    //owner
    this.owners = this.config.master;
    this.util = new Util(this);

    this.events = new Collection();
    this.languages = new Collection();
    this.dataLangs = new Array();
    this.i18n = new Collection();

    this.guildsData = require("../Models/Guilds");
    this.membersData = require("../Models/Members");
    this.usersData = require("../Models/Users");

    this.databaseCache = {};
    this.databaseCache.users = new Collection();
    this.databaseCache.guilds = new Collection();
    this.databaseCache.members = new Collection();

    console.log(chalk.bold.bgRed("CLIENT [INITIALISED]"));
  }

  get directory() {
    return `${path.dirname(require.main.filename)}${path.sep}`;
  }

  loadAssets() {
    const git_difference_url =
      "https://github.com/Sekai-World/sekai-master-db-diff.git";
    const local_path_data = "Assets/data";
    git(local_path_data).pull();
    const git_i18n_url = "https://github.com/Sekai-World/sekai-i18n";
    const local_path_i18n = "Assets/i18n";
    git(local_path_i18n).pull();
    console.log(chalk.bold.bgGreen("GIT_ASSET [PULLING...]"));
  }

  loadI18n() {
    glob(`./Assets/i18n/*`, (err, folders) => {
      folders.forEach((folder) => {
        var [...names] = folder.split("/");
        if (names[3].length < 6 && names[3] !== "CNAME") {
          this.dataLangs.push(names[3]);
        }
        glob(`./Assets/i18n/${names[3]}/*.json`, (err, files) => {
          files.forEach((file) => {
            const filecontent = require(`.${file}`);
            this.i18n.set(
              `${names[3]}|${file.slice(
                file.lastIndexOf("/") + 1,
                file.length - 5
              )}`,
              filecontent
            );
          });
        });
      });
    });
    console.log(chalk.bold.bgBlue(`CLIENT_I18N [LOADING...]`));
  }

  async loadCommands() {
    glob(`${this.directory}/Commands/**/*.js`, (err, files) => {
      if (err) throw new Error(err);

      for (const file of files) {
        delete require.cache[[`${file}`]];
        const command = new (require(file))(this),
          filename = file.slice(file.lastIndexOf("/") + 1, file.length - 3);

        if (!(command instanceof COMMAND))
          throw new SekaiError("INVALID_COMMAND_TYPE", filename);

        let c_conflict = this.commands.get(command.name.toLowerCase());
        if (c_conflict)
          throw new SekaiError(
            "COMMAND_CONFLICT",
            command.name,
            c_conflict.name
          );
        this.commands.set(command.name, command);

        command.aliases.length &&
          command.aliases.map((alias) => {
            const a_conflict = this.aliases.get(alias.toLowerCase());
            if (a_conflict)
              throw new SekaiError(
                "ALIAS_CONFLICT",
                alias,
                command.name,
                a_conflict
              );
            this.aliases.set(alias, command.name);
          });
      }
    });
    console.log(chalk.bold.bgBlue(`CLIENT_COMMAND [REGISTERING...]`));
  }
  async loadDatabse() {
    mongoose.connect(process.env.MONGO_URL);
  }

  loadEvents() {
    glob(`${this.directory}/Listeners/**/*.js`, (err, files) => {
      if (err) throw new Error(err);

      for (const file of files) {
        delete require.cache[[`${file}`]];
        const event = new (require(file))(this),
          eventname = file.slice(file.lastIndexOf("/") + 1, file.length - 3);

        this.events.set(eventname, event);

        if (event.enable) super.on(eventname, (...args) => event.run(...args));
      }
    });
    console.log(chalk.bold.bgBlue(`CLIENT_EVENT [LISTENING]`));
  }

  loadLanguages() {
    glob(`${this.directory}/Languages/**/*.js`, (err, files) => {
      if (err) throw new Error(err);

      for (const file of files) {
        delete require.cache[[`${file}`]];
        const local = new (require(file))(this),
          localname = file.slice(file.lastIndexOf("/") + 1, file.length - 3);

        this.language.set(localname, local.language);
      }
    });
    console.log(chalk.bold.bgBlue("CLIENT_LANGUAGE [LOADING...]"));
  }

  async findOrCreateUser({ id: userID }, isLean) {
    if (this.databaseCache.users.get(userID)) {
      return isLean
        ? this.databaseCache.users.get(userID).toJSON()
        : this.databaseCache.users.get(userID);
    } else {
      let userData = isLean
        ? await this.usersData.findOne({ id: userID }).lean()
        : await this.usersData.findOne({ id: userID });
      if (userData) {
        if (!isLean) this.databaseCache.users.set(userID, userData);
        return userData;
      } else {
        userData = new this.usersData({ id: userID });
        await userData.save();
        this.databaseCache.users.set(userID, userData);
        return isLean ? userData.toJSON() : userData;
      }
    }
  }

  async findOrCreateMember({ id: memberID, guildID }, isLean) {
    if (this.databaseCache.members.get(`${memberID}${guildID}`)) {
      return isLean
        ? this.databaseCache.members.get(`${memberID}${guildID}`).toJSON()
        : this.databaseCache.members.get(`${memberID}${guildID}`);
    } else {
      let memberData = isLean
        ? await this.membersData.findOne({ guildID, id: memberID }).lean()
        : await this.membersData.findOne({ guildID, id: memberID });
      if (memberData) {
        if (!isLean)
          this.databaseCache.members.set(`${memberID}${guildID}`, memberData);
        return memberData;
      } else {
        memberData = new this.membersData({ id: memberID, guildID: guildID });
        await memberData.save();
        const guild = await this.findOrCreateGuild({ id: guildID });
        if (guild) {
          guild.members.push(memberData._id);
          await guild.save();
        }
        this.databaseCache.members.set(`${memberID}${guildID}`, memberData);
        return isLean ? memberData.toJSON() : memberData;
      }
    }
  }

  async findOrCreateGuild({ id: guildID }, isLean) {
    if (this.databaseCache.guilds.get(guildID)) {
      return isLean
        ? this.databaseCache.guilds.get(guildID).toJSON()
        : this.databaseCache.guilds.get(guildID);
    } else {
      let guildData = isLean
        ? await this.guildsData
            .findOne({ id: guildID })
            .populate("members")
            .lean()
        : await this.guildsData.findOne({ id: guildID }).populate("members");
      if (guildData) {
        if (!isLean) this.databaseCache.guilds.set(guildID, guildData);
        return guildData;
      } else {
        guildData = new this.guildsData({ id: guildID });
        await guildData.save();
        this.databaseCache.guilds.set(guildID, guildData);
        return isLean ? guildData.toJSON() : guildData;
      }
    }
  }

  //ログイン
  async login() {
    try {
      await super.login(TOKEN);
      await mongoose.connect(MONGO_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
    } catch (e) {
      console.log(e);
    }
  }

  init() {
    this.loadI18n();
    this.loadCommands();
    this.loadEvents();
    this.login();
  }
}

module.exports = Sekai;
