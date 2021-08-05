const mongoose = require("mongoose");
const AmaneError = require("../Structures/Extender/Error");
const { Hex_Colors } = require("../Structures/Utils/Constants");

const resolveColor = (color) => {
  if (!color.startsWith("#")) {
    const Hex_Code = Hex_Colors.find(
      (c) => c.name.toLowerCase() === color.toLowerCase()
    );
    if (Hex_Code === undefined) {
      return Hex_Colors[0];
    } else {
      return Hex_Code;
    }
  } else {
    if (color.length === 7) {
      return { hex: color.toUpperCase() };
    } else {
      return Hex_Colors[0];
    }
  }
};

const genToken = () => {
  let token = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwzy0123456789.-_";
  for (let i = 0; i < 32; i++) {
    token += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return token;
};

const userSchema = new mongoose.Schema({
  id: { type: String, required: true },
  sekaiId: { type: String, default: "none" },

  language: { type: String, default: "en" },

  sekaiDataCahe: { type: Object, default: {} },
  sekaiEventDataCache: { type: Object, default: {} },

  color: { type: String, default: "#FFFFFF" },

  registeredAt: { type: Number, default: Date.now() },
  follow: { type: Array, default: [] },
  follower: { type: Array, default: [] },

  apiToken: { type: String, default: genToken() },
});

userSchema.method("genApiToken", async function () {
  this.apiToken = genToken();
  await this.save();
  return this.apiToken;
});

module.exports = mongoose.model("User", userSchema);
