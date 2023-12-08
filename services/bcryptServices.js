import crypto from 'crypto'
import bcrypt from 'bcrypt'

function hashPassword(password) {

    return bcrypt.hash(password, 10)
}

async function comparePassword(originalPassword, hashedPassword) {
    return await bcrypt.compare(originalPassword,hashedPassword)
}

export { hashPassword ,comparePassword}