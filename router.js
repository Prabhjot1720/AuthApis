import express from 'express';
import { MainHomePage } from './controllers/homePage.js';
import { getAllUsers, login, logout, register, resetPassword } from './controllers/Authentication.js';
import middleware from './middlewares/middleware.js';
import { rateLimiterUsingThirdParty } from './middlewares/rateLimitter.js';
const router = express.Router()
// const app = express.app()

// public routes 
router.get('/', MainHomePage)
router.post('/register',rateLimiterUsingThirdParty, register)
router.post('/login',rateLimiterUsingThirdParty, login)
router.post('/logout',rateLimiterUsingThirdParty,middleware, logout)


// protected routes 
router.post('/allUsers', rateLimiterUsingThirdParty, middleware, getAllUsers)
router.post('/resetPassword',rateLimiterUsingThirdParty,middleware,resetPassword)

export default router;