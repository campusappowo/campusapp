import express from "express";
import { Browser, Page } from "puppeteer";
import { v4 as uuidv4 } from "uuid";
import createBrowserAndPage from "./lmsapiHelpers/createBrowserAndPage";
import { config } from "dotenv";
import { User } from "../../db/db";
import { getDetails } from "./lmsapiHelpers/getDetails";

export const lmsapiRouter = express.Router();

const sessions = new Map<string, { browser: Browser; page: Page }>();

config();
const baseUrl = process.env.BASE_URL || "";

// ONE SINGLE Route to send UID,PASSWORD to, will send session id as a response and deliver a captcha.
// ALSO updates User collection in getCaptcha middleware.
lmsapiRouter.get("/", [startSession, getCaptcha] , async (req : express.Request ,res : any) => {
    res.send(res.session);
    console.log("captured captcha please respond with post.")
})

// ONE SINGLE Route to POST, send session ID and captcha to LOGIN, get your timetable and student detials.
// also update timetable collection.
lmsapiRouter.post("/", [submitCaptcha], (req : express.Request, res : any) => {
    console.log("Finished getting student details and shit");
    res.send({
        UID : res.UID,
        Name : res.Name,
        Timetable : res.Timetable
    });
})




// Start Session Middleware, to create a new browser session for each user.
async function startSession(req : express.Request ,res : any ,next : express.NextFunction) {
    const sessionId = uuidv4(); // Generate a random sessionId using UUID

    const { browser, page } = await createBrowserAndPage();

    // Store browser and page instance in the sessions map
    sessions.set(sessionId, { browser, page });

    console.log(`Session started for: ${sessionId}`);
    res.session = sessionId; // store sessionID to use in the next middleware
    next();
}

// Get captcha middleware, to get captcha delivered, uses userId and Password.
async function getCaptcha(req : express.Request ,res : any ,next : express.NextFunction) {
    const { userId, password } = req.body;
    const session = sessions.get(res.session); // Getting Session directly from a res variable that we stored in the prev middleware, i.e startSession

    if (!session) {
      return res.status(400).json({ error: "Session not found" });
    }

    const user = await User.findOne({
      uid : userId
    })

    if(user){
      // ADD LOGIC FOR WHAT TO DO WHEN USER EXISTS
    } 
    else { // WHEN USER DOES NOT EXIST IN DB WITH THE PROVIDED userId
      const newUser = new User({
        uid: userId,
        password : password
      })

      await newUser.save();
      console.log("created!")
    }
  
    const { page } = session;
  
    await page.goto(`${baseUrl}`);
    await page.type("#txtUserId", userId);
    await page.click("#btnNext");
    await page.waitForNavigation();
  
    await page.type("#txtLoginPassword", password);
    await page.waitForSelector("#imgCaptcha");
  
    const captchaElement = await page.$("#imgCaptcha");
    
    await captchaElement?.screenshot({ path: "captcha.png" });
    console.log("Captcha sent to client");

    next();
}

// submit captcha middleware, updates timetable and shit
async function submitCaptcha(req : express.Request ,res : any ,next : express.NextFunction) {
    const { sessionId, captcha } = req.body;
    const session = sessions.get(sessionId);
  
    if (!session) {
      return res.status(400).json({ error: "Session not found" });
    }
  
    const { page, browser } = session;

    const { studentName, studentUID, timetableObj } = await getDetails(page, captcha, baseUrl)
  
    res.UID = studentUID;
    res.Name = studentName;
    res.Timetable = timetableObj;

    const TT = await User.findOne({
      uid : studentUID
    });

    if(TT) {
      
    }
    else {
      const newTT = new User({
        uid: studentUID,
        name : studentName,
        timetable : timetableObj
      });
      await newTT.save();
      console.log("new time table saved for " + studentUID);
    }

    // Optionally close the session after use
    await browser.close();
    sessions.delete(sessionId); // Clean up the session
  
    console.log("Session closed and removed");

    next();
}