
import { comparePassword, hashPassword } from '../services/bcryptServices.js';
import { generateToken } from "../services/jwtServices.js"
import validator from 'email-validator'
import { createUser, deleteUser, emptyToken, findOneUser, findOneUserUsingEmailOrUsername, getPassword, getToken, updateEmailverificationStatus, updatePassword, updateToken } from "../services/userServices.js"
import { isEmailValid, sendEmail } from '../services/emailServices.js';
// import UserDTO from '../DTOs/UserDTO.js'


const register = async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) return res.json({ status: 'error', error: 'Enter all the details' })
    if (!username || typeof username !== 'string') return res.json({ status: 'error', error: 'Invalid username' })
    if (!password || typeof password !== 'string') return res.json({ status: 'error', error: 'Invalid password' })
    if (!isEmailValid(email)) return res.json({ status: 'error', error: 'Email entered is not Valid    ' })



    const hashedPassword = await hashPassword(password);
    try {
        const existingUser = await findOneUser({ email })
        if (existingUser) return res.json({ status: 'success', message: 'email already in use' })

        const existingUsername = await findOneUserUsingEmailOrUsername(username, "")
        if (existingUsername) return res.json({ status: 'success', message: 'username already in use' })

        const generatedToken = generateToken({ username, email })
        const verificationURL = `${process.env.clientURL}/verifyAccount?token=${generatedToken}&email=${email}&username=${username}`
        const response = await createUser({ username, email, password: hashedPassword, token: generatedToken })

        // await sendEmail(email, "Verify Your Account", "", "", verificationURL)

        // res.cookie('token', generatedToken, { maxAge: 86400 * 366 })
        // res.cookie('user', { username, email }, { maxAge: 86400 * 366 })

        return res.json({
            status: 'success', message: 'User Created Successfully. We have sent you an email, Please verify it',
            user: {
                username,
                email,
                verificationURL
                // token: generatedToken
            }
        })


    } catch (error) {
        if (error.code === 11000) {
            return res.json({ status: 'error', message: 'Username already in use' })
        }
        return res.json({ status: 'error', message: 'Something went wrong while registering User' })
    }

}
const verifyAccount = async (req, res) => {
    const token = req.query.token;
    const email = req.query.email;
    const username = req.query.username;

    if (!token || !email || !username) return res.json({ status: "error", message: "Invalid Link" })
    if (!isEmailValid) return res.json({ status: "error", message: "Invalid email" })

    // try {
    const currentUserToVerifyFromDB = await findOneUserUsingEmailOrUsername("", email);

    if (token !== currentUserToVerifyFromDB.token) return res.json({ status: "error", message: "Invalid or expired Token" })
    else {
        const updatedToken = generateToken({ username, email });
        await updateToken(username, email, updatedToken);
        await updateEmailverificationStatus(email, true);

        res.cookie('token', updatedToken, { maxAge: 86400 * 366 })
        res.cookie('user', { username, email }, { maxAge: 86400 * 366 })

        return res.json({ status: "success", message: "User Verified Successfully" });
    }
    // } catch (error) {
    //     return res.json({ status: "error", message: "something went wrong while verifying user" });
    // }



}

const login = async (req, res) => {
    const { username, email, password } = req.body;

    if (!username && !email) return res.json({ status: 'error', message: 'Please enter username or email' })
    if (!password) return res.json({ status: 'error', message: 'Please enter password' })
    if (!isEmailValid(email)) return res.json({ status: 'error', error: 'Email entered is not Valid    ' })

    const userFromDb = username ? await findOneUser({ username }) : await findOneUser({ email })

    if (!userFromDb) return res.json({ status: 'error', message: 'Invalid username/password' })
    const passwordFromDB = await getPassword(username, email);

    if (await comparePassword(password, passwordFromDB)) {
        if (!userFromDb.isEmailVerified ) return res.json({ status: "error", message: "Please Verify your Account. Verification link is in Your email." })
        const filteredUser = {
            username: userFromDb.username,
            email: userFromDb.email
        }
        const token = await getToken(username ? username : "", email ? email : "")

        // const updateTokenInDB= await updateToken(username?username:"",email?email:"",token)
        res.cookie('token', token, { maxAge: 86400 * 366 })
        res.cookie('user', filteredUser, { maxAge: 86400 * 366 })
        return res.json({
            status: 'success', message: 'Logged in successfully',
            token,
            filteredUser
        })
    }
    return res.json({ status: 'error', message: 'Password not matched' })

}

const logout = async (req, res) => {
    const { username, email } = req.body;
    if (!username && !email) return res.status(402).json({ status: "error", message: "Please enter username or email you want to loggout" })
    if (!isEmailValid(email)) return res.json({ status: 'error', error: 'Email entered is not Valid    ' })

    try {
        const existingUser = await findOneUserUsingEmailOrUsername(username, email);
        if (!existingUser) return res.json({ status: 'error', message: 'User does not exists' })

        emptyToken(username, email);
        res.cookie('token', '', { maxAge: 0 })
        return res.json({ status: 'success', message: 'User Logged Out!' })
    } catch (error) {
        return res.json({ status: 'error', message: 'something went wrog' })
    }

}

const getAllUsers = async (req, res) => {
    try {
        // const data = await User.find({});
        return res.json({ status: "success", message: "Fetched Data Successfuly" })
    } catch (error) {

        return res.json({ status: "error", message: "error fetching data" })
    }
}

const resetPassword = async (req, res) => {
    const { username, email, oldPassword, newPassword } = req.body;

    if (!username && !email) return res.json({ status: "error", message: "Please Enter Username or email" })
    if (!oldPassword || !newPassword) return res.json({ status: "error", message: "All fields required" })
    if (!isEmailValid(email)) return res.json({ status: 'error', error: 'Email entered is not Valid    ' })

    try {
        const existingUser = await findOneUserUsingEmailOrUsername(username, email);
        if (!existingUser) return res.json({ status: "error", message: "user Does not exists" })

        const check = await comparePassword(oldPassword, existingUser.password)

        if (check) {
            const hashedPassword = await hashPassword(newPassword)
            // console.log(hashedPassword)
            const updateduser = await updatePassword(username, email, hashedPassword);


            return res.json({ status: "success", message: "Password Changed successfully" })
        }
        else return res.json({ status: "error", message: "Incorrect Password" })

    } catch (error) {
        return res.json({ status: "error", message: "Something Went Wrong" })
    }
}

const requestResetPassword = async (req, res) => {
    const { email } = req.body;
    let username = "";
    if (!email) return res.json({ status: "error", message: "email is required to reset the password" })
    if (!isEmailValid(email)) return res.json({ status: "error", message: "Please enter a valid email" })

    try {
        const user = await findOneUserUsingEmailOrUsername(username, email);
        if (!user) return res.json({ status: "error", message: "User Does not exists" })

        let token = await getToken(username, email);
        if (token) await emptyToken(username, email);

        let resetToken = generateToken({ username, email })
        const hash = await hashPassword(resetToken);

        const updateTokenOfUser = await updateToken(username, email, resetToken);

        const link = `${process.env.clientURL}/passwordReset?token=${resetToken}&email=${email}`;

         sendEmail(
            email,
            "Password Reset Request",
            {
                name: user.username,
                link: link,
            },
            "/template/requestResetPassword.handlebars",
            link
        );
        // return { link };
        return res.json({ status: "success", message: "email sent successfully", link: link })
    } catch (error) {
        return res.json({ status: "error", message: "Something went wrong while sending email" })
    }
}
const passwordReset = async (req, res) => {
    const { password } = req.body;
    const token = req.query.token;
    const email = req.query.email;


    if (!token) return res.json({ status: "error", message: "Invalid Token" })
    if (!email || !isEmailValid(email)) return res.json({ status: "error", message: "Please enter valid email" })
    if (!password) return res.json({ status: "error", message: "Please enter password" })


    try {
        const userFromDB = await findOneUserUsingEmailOrUsername(null, email)


        if (token !== userFromDB.token) return res.json({ status: "error", message: "Invalid or expired password reset token" })
        else {
            const hashedPassword = await hashPassword(password)
            const newToken = generateToken({ username: userFromDB.username, email: userFromDB.email });
            await updatePassword(userFromDB?.username, email, hashedPassword);
            await updateToken(userFromDB?.username, email, newToken)

            return res.json({
                status: "success", message: "Password Updated Successfully",
                token: newToken,
            })
        }

    } catch (error) {
        res.json({ status: "success", message: "Something went wrong while reseting the password" })
    }

}

const deleteAccount = async (req, res) => {
    const { username, email } = req.body;
    try {
        const del = await deleteUser(username, email)
        return res.json({ status: "success", message: "deleted user" })
    } catch (error) {
        res.json({ status: "error", message: "Something went wrong while deleting user" })
    }
}


export {
    register,
    login,
    logout,
    getAllUsers,
    resetPassword,
    requestResetPassword,
    passwordReset,
    verifyAccount,
    deleteAccount
}