
import { comparePassword, hashPassword } from '../services/bcryptServices.js';
import { generateToken } from "../services/jwtServices.js"
import { createUser, emptyToken, findOneUser, findOneUserUsingEmailOrUsername, getPassword, getToken, updatePassword } from "../services/userServices.js"
// import UserDTO from '../DTOs/UserDTO.js'


const register = async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) return res.json({ status: 'error', error: 'Enter all the details' })

    if (!username || typeof username !== 'string') {
        return res.json({ status: 'error', error: 'Invalid username' })
    }
    if (!password || typeof password !== 'string') {
        return res.json({ status: 'error', error: 'Invalid password' })
    }



    const hashedPassword = await hashPassword(password);
    try {
        const existingUser = await findOneUser({ email })
        if (existingUser) return res.json({ status: 'success', message: 'email already in use' })
        const existingUsername = await findOneUserUsingEmailOrUsername(username, "")
        if(existingUsername) return res.json({ status: 'success', message: 'username already in use' })
        const generatedToken =  generateToken({ username, email })
        const response = await createUser({ username, email, password: hashedPassword,token:generatedToken })
        res.cookie('token', generatedToken, { maxAge: 86400 * 366 })
        res.cookie('user',{username,email},{ maxAge: 86400 * 366 })
        
        return res.json({
            status: 'success', message: 'User Created Success',
            user: {
                username,
                email,
                token:generatedToken
            }
        })


    } catch (error) {
        if (error.code === 11000) {
            return res.json({ status: 'error', message: 'Username already in use' })
        }
        return res.json({ status: 'error', message: 'Something went wrong while registering User' })
    }

}

const login = async (req, res) => {
    const { username, email, password } = req.body;

    if (!username && !email) return res.json({ status: 'error', message: 'Please enter username or email' })
    if (!password) return res.json({ status: 'error', message: 'Please enter password' })


    const userFromDb =username ? await findOneUser({ username} ) : await findOneUser({email})

    if (!userFromDb) return res.json({ status: 'error', message: 'Invalid username/password' })
    const passwordFromDB = await getPassword(username, email);
    
    if (await comparePassword(password,passwordFromDB)) {
        const filteredUser = {
            username: userFromDb.username,
            email:userFromDb.email
        }
        const token = await getToken(username ? username : "", email ? email : "")
        
        // const updateTokenInDB= await updateToken(username?username:"",email?email:"",token)
        res.cookie('token', token, { maxAge: 86400 * 366 })
        res.cookie('user',filteredUser,{ maxAge: 86400 * 366 })
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
    if(!username  && !email) return res.status(402).json({status:"error",message:"Please enter username or email you want to loggout"})
    
    try {
        const existingUser = await findOneUserUsingEmailOrUsername(username, email);
        if (!existingUser) return res.json({ status: 'error', message: 'User does not exists' })
        
        emptyToken(username, email);
        res.cookie('token', '', { maxAge: 0 })
        return res.json({ status: 'success', message: 'User Logged Out!'})
    } catch (error) {
        return res.json({ status: 'error', message: 'something went wrog'})
    }
   
}

const getAllUsers = async (req, res) => {
    try {
        // const data = await User.find({});
        return res.json({status:"success",message:"Fetched Data Successfuly"})
    } catch (error) {
        
        return res.json({ status: "error", message: "error fetching data" })
    }
}

const resetPassword = async (req, res) => {
    const { username, email, oldPassword, newPassword } = req.body;

    if (!username && !email) return res.json({ status: "error", message: "Please Enter Username or email" })
    if (!oldPassword || !newPassword) return res.json({ status: "error", message: "All fields required" })
    
    try {
        const existingUser = await findOneUserUsingEmailOrUsername(username, email);
        if (!existingUser) return res.json({ status: "error", message: "user Does not exists" })
        
        const check = await comparePassword(oldPassword, existingUser.password)

        if (check) {
            const hashedPassword= await hashPassword(newPassword)
            // console.log(hashedPassword)
            const updateduser = await updatePassword(username, email, hashedPassword);
           

            return res.json({status:"success",message:"Password Changed successfully"})
        }
        else return res.json({status:"error",message:"Incorrect Password"})
        
    } catch (error) {
        return res.json({ status: "error", message: "Something Went Wrong" })
    }
}


export {
    register,
    login,
    logout,
    getAllUsers,
    resetPassword
}