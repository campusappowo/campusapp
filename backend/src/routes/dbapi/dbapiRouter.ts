import express from "express";
import { User } from "../../db/db";
import { JwtPayload, verify } from "jsonwebtoken";
import { config } from "dotenv";

config();

export const dbRouter = express.Router();

const dayNames: Array<'Sun' | 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat'>  = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

dbRouter.use("/*", async (req,res : any,next) => {
    const authHeaders = req.headers.authorization;
    
    if(!authHeaders) {
        return res.send({
            msg : "not logged in desu"
        })
    }

    const token = authHeaders.split(' ')[1];
    const payload = verify(token ,  process.env.JWT_SECRET || 'SECRET');

    res.payload = payload;
    next(); 
})

dbRouter.get("/details", async (req,res : any) => {

    const today = dayNames[new Date().getDay()];

    console.log(res.payload.password)
    
    const user = await User.findOne({
        uid : res.payload.id
    })

    const timeTable = {
        day : today,
        // @ts-expect-error
        schedule : (user.timetable[today as keyof typeof user.timetable])
    }
    
    res.json({user , timeTable});
})

