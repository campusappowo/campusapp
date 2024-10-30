import express from "express";
import { Browser, Page } from "puppeteer";
import { v4 as uuidv4 } from "uuid";
import createBrowserAndPage from "./lmsapiHelpers/createBrowserAndPage";
import { buildTimetable } from "./lmsapiHelpers/buildTimetable";
import { config } from "dotenv";

export const lmsapiRouter = express.Router();

const sessions = new Map<string, { browser: Browser; page: Page }>();

config();
const baseUrl = process.env.BASE_URL || "";

lmsapiRouter.get("/", [startSession, getCaptcha] , async (req : express.Request ,res : any) => {
    res.send(res.session);
    console.log("captured captcha please respond with post.")
})

lmsapiRouter.post("/", [submitCaptcha], (req : express.Request, res : any) => {
    console.log("Finished getting student details and shit");
    res.send({
        UID : res.UID,
        Name : res.Name,
        Timetable : res.Timetable
    });
})

async function startSession(req : express.Request ,res : any ,next : express.NextFunction) {
    const sessionId = uuidv4(); // Generate a random sessionId using UUID

    const { browser, page } = await createBrowserAndPage();

    // Store browser and page instance in the sessions map
    sessions.set(sessionId, { browser, page });

    console.log(`Session started for: ${sessionId}`);
    res.session = sessionId;
    next();
    // res.json({ sessionId, message: `Session started for ${sessionId}` });

}

async function getCaptcha(req : express.Request ,res : any ,next : express.NextFunction) {
    const { userId, password } = req.body;
    const session = sessions.get(res.session);

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

async function submitCaptcha(req : express.Request ,res : any ,next : express.NextFunction) {
    const { sessionId, captcha } = req.body;
    const session = sessions.get(sessionId);
  
    if (!session) {
      return res.status(400).json({ error: "Session not found" });
    }
  
    const { page, browser } = session;
  
    await page.type("#txtcaptcha", captcha);
    await page.click("#btnLogin");
    await page.waitForNavigation();
  
    await page.goto(`${baseUrl}frmStudentProfile.aspx`);
    await page.waitForSelector("#lbstuUID");
  
    const studentName = await page.$eval(
      "#ContentPlaceHolder1_lblName",
      (el) => el.textContent?.trim() || ""
    );
    const studentUID = await page.$eval(
      "#lbstuUID",
      (el) => el.textContent?.trim() || ""
    );
  
    await page.goto(`${baseUrl}frmMyTimeTable.aspx`);
    await page.waitForSelector("#ContentPlaceHolder1_grdMain");
  
    const timetableArray = await page.$$eval(
      "#ContentPlaceHolder1_grdMain tr",
      (rows) => {
        return rows.map((row) => {
          const cells = Array.from(row.querySelectorAll("td, th"));
          return cells.map((cell) => cell?.textContent?.trim() || "");
        });
      }
    );
  
    const timetableObj = buildTimetable(timetableArray);
  
    res.UID = studentUID;
    res.Name = studentName;
    res.Timetable = timetableObj;

    // Optionally close the session after use
    await browser.close();
    sessions.delete(sessionId); // Clean up the session
  
    console.log("Session closed and removed");

    next();
}