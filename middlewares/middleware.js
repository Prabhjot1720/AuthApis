
import jwt from 'jsonwebtoken'
import { getToken } from '../services/userServices.js';
export default async function middleware(req, res, next) {
    const token = req.cookies.token;
    const user = req.cookies.user;



    if (!token) {
        return res.status(401).json({ status: 'error', message: 'Unauthorized User' });
    }




    try {

        const tokenInDB = await getToken(user.username, user.email);
        if (token != tokenInDB) return res.status(401).json({ status: "error", message: 'Invalid TOken' });



        const decoded = jwt.verify(token, "process.env.JWT_KEY")
        const currentTimestamp = Math.floor(Date.now() / 1000);
        if (decoded.exp && decoded.exp < currentTimestamp) {
            return res.status(401).json({ status: "error", message: 'Token has expired' });
        }

        req.body.loggedInUser = decoded;


        next()
    } catch (error) {
        return res.status(401).json({ status: 'error', message: 'Something went wrong while validating user' })
    }



}