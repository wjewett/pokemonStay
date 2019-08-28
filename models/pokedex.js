const mongoose = require("mongoose");

const pokedexSchema = new mongoose.Schema({
  name: String,
  id: Number,
  types: Array,
  evolutions: Array
});

module.exports = mongoose.model("Pokedex", pokedexSchema);