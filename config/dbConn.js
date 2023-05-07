require('dotenv').config();
const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.DATABASE_URI, {
            useUnifiedTopology: true,
            useNewURlParser: true
        })
    } catch (err) {
        console.error(err);
        console.log(process.env.DATABASE_URI);
    }
}

module.exports = connectDB