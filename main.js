const mongoose = require('mongoose');
const State = require('./models/States');

mongoose.connect('mongodb://localhost:27017/myDatabase', { useNewUrlParser: true });

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('Connected to MongoDB');

  // create the collection using the States model
  mongoose.connection.db.createCollection('states', function(err, res) {
    if (err) throw err;
    console.log('States collection created');

    // seed the collection with data
    const seedData = [
      { stateCode: 'KS', funfacts: ['The highest point is Mt. Sunflower at 4,039 feet', 'The Motto of Kansas is “To the Stars Through Difficulties”', 'The Origin of the State Name:  From the Sioux Tribe for “south wind people”'] },
      { stateCode: 'MO', funfacts: ['The highest point is Taum Sauk Mountain at 1,772 feet.', 'Missouri Day is the third Wednesday in October.', 'Richland, Missouri is home to the US’ only cave restaurant. '] },
      { stateCode: 'OK', funfacts: ['The bread twist tie was invented in Maysville, OK.', 'The shopping cart was invented in Ardmore, OK in 1936.', 'The Oklahoma State Capital is the only capital in the U.S. with working oil wells on its grounds.'] },
      { stateCode: 'NE', funfacts: ['Nebraska is the birth place of Kool-Aid.', 'Has the largest indoor rainforest.', 'It has a lighthouse, but no ocean!'] },
      { stateCode: 'CO', funfacts: ['It was on top of Pikes Peak (another Colorado 14er) in 1893 that Katherine Lee Bates was inspired to write the words to "America the Beautiful".','Colorado is nicknamed the "Centennial State" because it became a state in the year 1876. That 100 years after the signing of the Declaration of Independence.','The United States has a total of 91 "fourteeners" (mountain peaks over 14,000 feet). Fifty-six of them are in Colorado.']}
    ];

    State.insertMany(seedData, function(err, docs) {
      if (err) throw err;
      console.log(`${docs.length} states added to the collection`);
      db.close();
    });
  });
});
