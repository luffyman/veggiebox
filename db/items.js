const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const itemsModel = new Schema({
  itemName: { type: String, default: ''},
  itemCategory: { type: String, default: '' },
  itemQty: { type: String, },
});

module.exports = mongoose.model('items', itemsModel);