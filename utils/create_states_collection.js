// Import required modules
const mongoose = require('mongoose');
const State = require('../models/States.js');
const connectDB = require('../config/dbConn.js'); // Update the path to the connectDB module accordingly

// Call connectDB to connect to the database
connectDB()
  .then(() => {
    console.log('Connected to MongoDB');
    seedStates();
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
  });

async function seedStates() {
  const seedData = [
    { stateCode: 'KS', funfacts: ['The highest point is Mt. Sunflower at 4,039 feet', 'The Motto of Kansas is “To the Stars Through Difficulties”', 'The Origin of the State Name:  From the Sioux Tribe for “south wind people”'] },
    { stateCode: 'MO', funfacts: ['The highest point is Taum Sauk Mountain at 1,772 feet.', 'Missouri Day is the third Wednesday in October.', 'Richland, Missouri is home to the US’ only cave restaurant. '] },
    { stateCode: 'OK', funfacts: ['The bread twist tie was invented in Maysville, OK.', 'The shopping cart was invented in Ardmore, OK in 1936.', 'The Oklahoma State Capital is the only capital in the U.S. with working oil wells on its grounds.'] },
    { stateCode: 'NE', funfacts: ['Nebraska is the birth place of Kool-Aid.', 'Has the largest indoor rainforest.', 'It has a lighthouse, but no ocean!'] },
    { stateCode: 'CO', funfacts: ['It was on top of Pikes Peak (another Colorado 14er) in 1893 that Katherine Lee Bates was inspired to write the words to "America the Beautiful".', 'Colorado is nicknamed the "Centennial State" because it became a state in the year 1876. That 100 years after the signing of the Declaration of Independence.', 'The United States has a total of 91 "fourteeners" (mountain peaks over 14,000 feet). Fifty-six of them are in Colorado.'] }
  ];

  for (const stateData of seedData) {
    const existingState = await State.findOne({ stateCode: stateData.stateCode });
    if (existingState) {
      console.log(`State with code ${stateData.stateCode} already exists. Skipping...`);
      continue;
    }

    const newState = new State(stateData);
    await newState.save();
    console.log(`State with code ${stateData.stateCode} inserted successfully`);
  }

  mongoose.connection.close(); // close the connection to the database
}
