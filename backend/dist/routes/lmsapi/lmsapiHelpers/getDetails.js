"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDetails = getDetails;
const buildTimetable_1 = require("./buildTimetable");
function getDetails(page, captcha, baseUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        yield page.type("#txtcaptcha", captcha);
        yield page.click("#btnLogin");
        yield page.waitForNavigation();
        console.log("Clicked login");
        yield page.screenshot({ path: "pagess.png" });
        yield page.goto(`${baseUrl}frmStudentProfile.aspx`);
        yield page.waitForSelector("#lbstuUID");
        const studentName = yield page.$eval("#ContentPlaceHolder1_lblName", (el) => { var _a; return ((_a = el.textContent) === null || _a === void 0 ? void 0 : _a.trim()) || ""; });
        const studentUID = yield page.$eval("#lbstuUID", (el) => { var _a; return ((_a = el.textContent) === null || _a === void 0 ? void 0 : _a.trim()) || ""; });
        yield page.goto(`${baseUrl}frmMyTimeTable.aspx`);
        yield page.waitForSelector("#ContentPlaceHolder1_grdMain");
        const timetableArray = yield page.$$eval("#ContentPlaceHolder1_grdMain tr", (rows) => {
            return rows.map((row) => {
                const cells = Array.from(row.querySelectorAll("td, th"));
                return cells.map((cell) => { var _a; return ((_a = cell === null || cell === void 0 ? void 0 : cell.textContent) === null || _a === void 0 ? void 0 : _a.trim()) || ""; });
            });
        });
        const timetableObj = (0, buildTimetable_1.buildTimetable)(timetableArray);
        return { studentName, studentUID, timetableObj };
    });
}
