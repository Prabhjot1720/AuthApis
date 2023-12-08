import User from "../models/User.js";

async function createUser({
    username,
    email,
    password,
    token
}) {
    const res = await User.create({
        username,
        email,
        password,
        token
    })
    return res;
}

function findOneUser(user) {
    return User.findOne(user)
}
async function findOneUserUsingEmailOrUsername(username, email) {
    if (username) return User.findOne({ username });
    else if (email) return User.findOne({ email })
    else return null;
}
function updateToken(username,email,token) {
    if (username != "") return User.findOneAndUpdate({ username }, { token: token })
    else if (email != "") return User.findOneAndUpdate({ email }, { token: token })
    else return null;
}

function emptyToken(username,email) {
    if (username ) return User.findOneAndUpdate({ username }, { token: "" })
    else if (email ) return User.findOneAndUpdate({ email }, { token: "" })
    else return null;
}

async function getToken(username, email) {
    let currentUser;
    if (username != "") currentUser=await User.findOne( {username} )
    else if (email != "") currentUser = await User.findOne( {email} )
    else return null;
    // console.log(username,email)
    return currentUser.token;
}

async function getPassword(username, email) {
    let currentUser;
    if (username) currentUser=await User.findOne( {username} )
    else if (email) currentUser = await User.findOne( {email} )
    else return null;
    // console.log(username,email)
    return currentUser.password;
}
async function updatePassword(username, email,password) {
    if (username ) return User.findOneAndUpdate({ username }, { password })
    else if (email ) return User.findOneAndUpdate({ email }, { password })
    else  throw error("cannot Find user");
}


async function updateEmailverificationStatus(email, status) {
    await User.findOneAndUpdate({ email: email }, { isEmailVerified: status })
    return
}
async function deleteUser(username, email) {
    if (username ) return User.deleteOne({ username })
    else if (email ) return User.deleteOne({ email })
    else  throw error("cannot Find user");
}
export {
    createUser,
    findOneUser,
    updateToken,
    getToken,
    emptyToken,
    findOneUserUsingEmailOrUsername,
    getPassword,
    updatePassword,
    deleteUser,
    updateEmailverificationStatus
}