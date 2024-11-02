import express from "express";
import { Browser, Page } from "puppeteer";
import { v4 as uuidv4 } from "uuid";
import createBrowserAndPage from "./lmsapiHelpers/createBrowserAndPage";
import { config } from "dotenv";
import { User } from "../../db/db";
import { getDetails } from "./lmsapiHelpers/getDetails";
import { verify } from "jsonwebtoken";

export const lmsapiRouter = express.Router();

const sessions = new Map<string, { browser: Browser; page: Page }>();

config();
const baseUrl = process.env.BASE_URL || "";

lmsapiRouter.use("/*", (req,res : any,next) => {
  const authHeaders = req.headers.authorization;
  if(!authHeaders) {
    return res.send("Not logged in");
  }

  const token = authHeaders.split(' ')[1];
  const payload = verify(token, process.env.JWT_SECRET || 'SECRET');

  res.payload = payload;

  next();

})

// ONE SINGLE Route to send UID,PASSWORD to, will send session id as a response and deliver a captcha.
// ALSO updates User collection in getCaptcha middleware.
lmsapiRouter.get("/", [startSession, getCaptcha] , async (req : express.Request ,res : any) => {
    console.log("captured captcha please respond with post.")
    res.send(res.session);
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
    const { userId, password } = res.payload
    const session = sessions.get(res.session); // Getting Session directly from a res variable that we stored in the prev middleware, i.e startSession

    if (!session) {
      return res.status(400).json({ error: "Session not found" });
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
// TODO : DEAL WITH WRONG CAPTCHA AND/OR WRONG ID PASSWORD
async function submitCaptcha(req : express.Request ,res : any ,next : express.NextFunction) {
    const {userId,password} = res.payload;
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

    const user = await User.findOne({
      uid : studentUID
    });

    if(user) {
      console.log("user found");
      // WHAT TO DO IF STUDENT ALREADY EXISTS
    }
    else {
      console.log("user not found");
      const newUser = new User({
        uid: studentUID,
        password : password,
        name : studentName,
        timetable : timetableObj
      });
      await newUser.save();
      console.log("new time table saved for " + studentUID);
    }

    // Optionally close the session after use
    await browser.close();
    sessions.delete(sessionId); // Clean up the session
  
    console.log("Session closed and removed");

    next();
}