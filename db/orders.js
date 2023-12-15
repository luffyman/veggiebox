const dayjs = require('dayjs');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ordersModel = new Schema({
  clientId: { type: String, default: ''},
  status: { type: String, default: '' },
  deliveryLocation: { type: String, default: ''},
  ordertime: { type: String, require: true, default: dayjs().format('DD-MM-YYYY') },
  payableAmount: { type: String,  default: '' },
  
});

module.exports = mongoose.model('orders', ordersModel);