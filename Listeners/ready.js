const chalk = require("chalk"),
  axios = require("axios"),
  glob = require("glob"),
  fs = require("fs"),
  Card = require("../Structures/Utils/Card"),
  path = require("path");

class Ready {
  constructor(client) {
    this.enable = true;
    this.client = client;
  }
  async run() {
    const client = this.client;
    console.log(chalk.bold.bgBlue("CLIENT [READY]"));

    //<<<<<<<<<<<<<<<===================for debug====================>>>>>>>>>>>>>>>>>
    /*const card = new Card(this.client,{
      prefix:"雅",
      language:"ja",
    })
    const CARD_DATA = card.search();
    card.setCard(card.getCardById(CARD_DATA[0]));
    
    console.log(card.getMax())*/
  }
}

module.exports = Ready;
