const mongoose = require("mongoose");

const pokemonSchema = new mongoose.Schema({
  name: String,
  number: String,
  comments: String,
  evolve: String,
  types: Array,
  stats: Array,
  created: {type: Date, default: Date.now},
  author: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    username: String
  }
});

module.exports = mongoose.model("Pokemon", pokemonSchema);