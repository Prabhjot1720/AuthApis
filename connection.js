import mongoose from "mongoose";

export default async function dbconn() {

    // for development purpose I am not putting in .env file
    const url = 'mongodb+srv://prabhjot:prabhjot@cluster0.qekpctj.mongodb.net/' 
    mongoose.connect(url, {
        useNewUrlParser: true,
        useUnifiedTopology: true,

    }).then(() => {
        console.log("Successfully connected to the database");
    }).catch(err => {
        console.log('Could not connect to the database. Exiting now...', err);
        process.exit();
    });
}
