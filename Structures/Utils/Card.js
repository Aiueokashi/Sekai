const { SekaiEmbed, PagenatedEmbed } = require("../Embed"),
  SekaiError = require("../Extender/Error"),
  episodes = require('../../Assets/data/cardEpisodes.json'),
  rarities = require('../../Assets/data/cardRarities.json'),
  { Hex_Colors, Colors, Emojis } = require("./Constants");


class Card {
  constructor(client,options = {}) {
    this.client = client;
    
    this.id = options.id || [];
    this.prefix = options.prefix || "null";
    this.language = options.language || 'en';
  }
  
  search(){
    const transCardPref = this.client.i18n.get(`${this.language}|card_prefix`);
    const transCardName = this.client.i18n.get(`${this.language}|card`);
    const CARD_DATAS = require('../../Assets/data/cards.json');
    const CARD_ID_ARR = new Array();
    
    for(const o of Object.entries(transCardPref)){
      if(o[1].includes(this.prefix)){
        CARD_ID_ARR.push(o[0]);
      }
    }
    return CARD_ID_ARR;
  }
  
  getCardById(id){
    const CARD_DATAS = require('../../Assets/data/cards.json');
    const card = CARD_DATAS.find(c => parseInt(c.id) === parseInt(id)) 
    return card;
  }
  
  setCard(card){
    this.data = card;
  }
  
  getMax() {
    const card = this.data
		const rarity = rarities.find(rarity => rarity.rarity === card.rarity);

		const maxLevel = rarity.trainingMaxLevel || rarity.maxLevel;

		let maxParam =
			card.cardParameters
				.filter(cp => cp.cardLevel === maxLevel)
				.reduce((sum, cp) => {
					sum += cp.power;
					return sum;
				}, 0) +
			episodes
				.filter(episode => episode.cardId === card.id)
				.reduce((sum, episode) => {
					sum += episode.power1BonusFixed;
					sum += episode.power2BonusFixed;
					sum += episode.power3BonusFixed;
					return sum;
				}, 0);
		if (card.rarity >= 3)
			maxParam +=
				card.specialTrainingPower1BonusFixed +
				card.specialTrainingPower2BonusFixed +
				card.specialTrainingPower3BonusFixed;

		return maxParam;
	}
	
}

module.exports = Card;