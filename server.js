// const cors = require('cors')
// const express = require('express')
// cosn


import cors from 'cors';
import express from 'express';
import router from './router.js';
import cookieParser from 'cookie-parser'
import bodyParser from 'body-parser'
import dbconn from './connection.js';
import dotenv from 'dotenv'
const app = express();


dbconn();
dotenv.config()
app.use(cors());
app.options('*', cors());
app.use(cookieParser());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }))
app.use(router);



app.listen(process.env.PORT || 5000, () =>
  console.log(`Example app listening on port ${process.env.PORT || 5000}!`),
);