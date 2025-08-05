const mongoose = require('mongoose');

const stopSchema = new mongoose.Schema({
  name: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  time : { type: String, required: true },
});

const busSchema = new mongoose.Schema({
  busNumber: { type: String, required: true, unique: true },
  routeName: { type: String, required: true },
  stops: [stopSchema],
  locationsCovered: [String],
});

const Bus = mongoose.model('Bus', busSchema);

module.exports = Bus;