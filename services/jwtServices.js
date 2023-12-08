import jwt from "jsonwebtoken"

function generateToken(user) {
    return jwt.sign(user, "process.env.JWT_KEY", {
        algorithm: 'HS256',
        expiresIn: 86400 * 366  //1 year
    })
}


export {generateToken}