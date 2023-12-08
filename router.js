import express from 'express';
import { MainHomePage } from './controllers/homePage.js';
import { deleteAccount, getAllUsers, login, logout, passwordReset, register, requestResetPassword, resetPassword, verifyAccount } from './controllers/Authentication.js';
import middleware from './middlewares/middleware.js';
import { rateLimiterUsingThirdParty } from './middlewares/rateLimitter.js';
const router = express.Router()
// const app = express.app()

// public routes 
router.get('/', MainHomePage)
router.post('/register', rateLimiterUsingThirdParty, register)
router.post('/login', rateLimiterUsingThirdParty, login)
router.post('/logout', rateLimiterUsingThirdParty, middleware, logout)


// protected routes 
router.post('/allUsers', rateLimiterUsingThirdParty, middleware, getAllUsers)
router.post('/resetPassword', rateLimiterUsingThirdParty, middleware, resetPassword)

router.post('/requestResetPassword', requestResetPassword)
router.post('/passwordReset', passwordReset)

router.post('/verifyAccount', rateLimiterUsingThirdParty, verifyAccount)
router.post('/deleteUser', deleteAccount)
export default router;