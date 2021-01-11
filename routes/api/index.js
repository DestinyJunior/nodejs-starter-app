import express from "express";
const apiRoutes = express.Router();


// add api routes below
import authRoutes from "./modules/authRoutes.js";
import userRoutes from "./modules/userRoutes.js";

apiRoutes.use('/auth/accounts', authRoutes);

apiRoutes.use('/auth/users', userRoutes);



export default  apiRoutes;