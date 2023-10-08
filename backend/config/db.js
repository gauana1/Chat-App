const mongoose = require('mongoose');

const connectDB = async() => {
    try{
        const connect = await mongoose.connect(process.env.Monog_URI, {
            useNewUrlParser:true, useUnifiedTopology:true
        });
        console.log("slay");
    } catch(err){
        console.log(`Error: ${err.message}`);
        process.exit();
    }
}

module.exports = connectDB;