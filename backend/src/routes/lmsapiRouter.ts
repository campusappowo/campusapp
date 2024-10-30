import express from "express";
import puppeteer, { Browser, Page } from "puppeteer";
import jwt from "jsonwebtoken"
import { v4 as uuidv4 } from "uuid";
import createBrowserAndPage from "./lmsapiHelpers/createBrowserAndPage";
import { buildTimetable } from "./lmsapiHelpers/buildTimetable";


export const lmsapiRouter = express.Router();

const sessions = new Map<string, { browser: Browser; page: Page }>();

lmsapiRouter.post("/startSession", async (req, res) => {
    const sessionId = uuidv4(); // Generate a random sessionId using UUID

    const { browser, page } = await createBrowserAndPage();

    // Store browser and page instance in the sessions map
    sessions.set(sessionId, { browser, page });

    console.log(`Session started for: ${sessionId}`);
    res.json({ sessionId, message: `Session started for ${sessionId}` });
})

lmsapiRouter.post("/", async (req, res) => {
    const { sessionId, userId, password } = req.body;
    const session = sessions.get(sessionId);
  
    if (!session) {
      return res.status(400).json({ error: "Session not found" });
    }
  
    const { page } = session;
  
    await page.goto(`https://students.cuchd.in/`);
    await page.type("#txtUserId", userId);
    await page.click("#btnNext");
    await page.waitForNavigation();
  
    await page.type("#txtLoginPassword", password);
    await page.waitForSelector("#imgCaptcha");
  
    const captchaElement = await page.$("#imgCaptcha");
    const captchaBuffer = await captchaElement?.screenshot();
  
    await captchaElement?.screenshot({ path: "captcha.png" });
  
    res.type("image/png").send(captchaBuffer);
    console.log("Captcha sent to client");
});

lmsapiRouter.post("/studentDetails", async (req, res) => {
    const { sessionId, captcha } = req.body;
    const session = sessions.get(sessionId);
  
    if (!session) {
      return res.status(400).json({ error: "Session not found" });
    }
  
    const { page, browser } = session;
  
    await page.type("#txtcaptcha", captcha);
    await page.click("#btnLogin");
    await page.waitForNavigation();
  
    await page.goto(`https://students.cuchd.in/frmStudentProfile.aspx`);
    await page.waitForSelector("#lbstuUID");
  
    const studentName = await page.$eval(
      "#ContentPlaceHolder1_lblName",
      (el) => el.textContent?.trim() || ""
    );
    const studentUID = await page.$eval(
      "#lbstuUID",
      (el) => el.textContent?.trim() || ""
    );
  
    await page.goto(`https://students.cuchd.in/frmMyTimeTable.aspx`);
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
  
    res.json({ UID: studentUID, Name: studentName, Timetable: timetableObj });
  
    // Optionally close the session after use
    await browser.close();
    sessions.delete(sessionId); // Clean up the session
  
    console.log("Session closed and removed");
});
  
  

  