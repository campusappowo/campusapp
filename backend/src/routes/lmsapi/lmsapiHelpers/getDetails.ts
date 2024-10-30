import { Page } from "puppeteer";
import { buildTimetable } from "./buildTimetable";

export async function getDetails(page : Page, captcha : any, baseUrl : string){
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

    return { studentName, studentUID, timetableObj }; 
}