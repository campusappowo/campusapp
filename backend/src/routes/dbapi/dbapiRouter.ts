import express from "express";
import { User } from "../../db/db";

export const dbRouter = express.Router();

const dayNames: Array<'Sun' | 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat'>  = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

dbRouter.get("/details", async (req,res) => {

    const today = dayNames[new Date().getDay()];
    
    const user = await User.findOne({
        uid : '21BCS5724'
    })
    const timetableResponse = await User.findOne({
        uid: '21BCS5724'
    })

    const timeTable = {
        day : today,
        // @ts-expect-error
        schedule : (timetableResponse.timetable[today as keyof typeof timetableResponse.timetable])
    }
    
    res.json({user , timeTable});
})

