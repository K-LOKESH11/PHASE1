require('dotenv').config();
const mongoose = require('mongoose');
const Bus = require('../models/Bus');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);

  await Bus.deleteMany({}); // Clear existing data

  const buses = [
    {
      busNumber: '28',
      routeName: 'Mylapore',
      locationsCovered: ['Mylapore', 'Mandavali', 'Teynampet','Nandanam','Saidapet','Guindy','Porur','Poonamallee','Panimalar Engineering College'],
      stops: [
        { name: 'Mylapore Stop', latitude: 13.031650, longitude: 80.270099, time: '6:20 am'},
        { name: 'Mandaveli', latitude: 13.025845, longitude: 80.262788 ,time: '6:15 am'},
        { name: 'Teynampet', latitude: 13.044403, longitude: 80.251648 },
        { name: 'Nandanam', latitude: 13.025324, longitude: 80.236306 },
        { name: 'Saidapet', latitude: 13.020817, longitude: 80.223954 },
        { name: 'Guindy', latitude: 13.010236, longitude: 80.215652 },
        { name: 'Porur', latitude: 13.038063, longitude: 80.159607 },
        { name: 'Poonamallee', latitude: 13.049874, longitude: 80.091291 },
      ],
    },
    {
      busNumber: '96',
      routeName: 'VGP',
      locationsCovered: ['Kotturpuram', 'Adyar'],
      stops: [
        { name: 'Kotturpuram Stop', latitude: 13.0258, longitude: 80.2559 },
        { name: 'Adyar Stop', latitude: 12.9950, longitude: 80.2498 },
      ],
    },
  ];

  await Bus.insertMany(buses);
  console.log('Database seeded!');
  mongoose.disconnect();
}

seed();