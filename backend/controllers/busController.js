const Bus = require('../models/Bus');

// Search buses by location (case insensitive)
exports.searchBuses = async (req, res) => {
  const location = req.query.location;
  if (!location) return res.status(400).json({ message: 'Location is required.' });

  try {
    const buses = await Bus.find({
      locationsCovered: { $regex: location, $options: 'i' },
    }).select('busNumber routeName');
    res.json(buses);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get bus details by bus number
exports.getBusDetails = async (req, res) => {
  const busNumber = req.params.busNumber;
  try {
    const bus = await Bus.findOne({ busNumber });
    if (!bus) return res.status(404).json({ message: 'Bus not found' });
    res.json(bus);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};