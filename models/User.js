import mongoose from "mongoose";


const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    token: {
        type: String,
        required:false
    },
    isEmailVerified: {
        type: Boolean,
        required:false
    }
})

export default  mongoose.model('Users', userSchema);
