import mongoose from "mongoose";

export default async function dbconn() {

    const url = 'mongodb://127.0.0.1:27017/authapis'
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
