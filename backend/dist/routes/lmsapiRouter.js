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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.lmsapiRouter = void 0;
const express_1 = __importDefault(require("express"));
const uuid_1 = require("uuid");
const createBrowserAndPage_1 = __importDefault(require("./lmsapiHelpers/createBrowserAndPage"));
const buildTimetable_1 = require("./lmsapiHelpers/buildTimetable");
exports.lmsapiRouter = express_1.default.Router();
const sessions = new Map();
exports.lmsapiRouter.post("/startSession", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const sessionId = (0, uuid_1.v4)(); // Generate a random sessionId using UUID
    const { browser, page } = yield (0, createBrowserAndPage_1.default)();
    // Store browser and page instance in the sessions map
    sessions.set(sessionId, { browser, page });
    console.log(`Session started for: ${sessionId}`);
    res.json({ sessionId, message: `Session started for ${sessionId}` });
}));
exports.lmsapiRouter.post("/getCaptcha", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { sessionId, userId, password } = req.body;
    const session = sessions.get(sessionId);
    if (!session) {
        return res.status(400).json({ error: "Session not found" });
    }
    const { page } = session;
    yield page.goto(`https://students.cuchd.in/`);
    yield page.type("#txtUserId", userId);
    yield page.click("#btnNext");
    yield page.waitForNavigation();
    yield page.type("#txtLoginPassword", password);
    yield page.waitForSelector("#imgCaptcha");
    const captchaElement = yield page.$("#imgCaptcha");
    const captchaBuffer = yield (captchaElement === null || captchaElement === void 0 ? void 0 : captchaElement.screenshot());
    yield (captchaElement === null || captchaElement === void 0 ? void 0 : captchaElement.screenshot({ path: "captcha.png" }));
    res.type("image/png").send(captchaBuffer);
    console.log("Captcha sent to client");
}));
exports.lmsapiRouter.post("/submitCaptcha", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { sessionId, captcha } = req.body;
    const session = sessions.get(sessionId);
    if (!session) {
        return res.status(400).json({ error: "Session not found" });
    }
    const { page, browser } = session;
    yield page.type("#txtcaptcha", captcha);
    yield page.click("#btnLogin");
    yield page.waitForNavigation();
    yield page.goto(`https://students.cuchd.in/frmStudentProfile.aspx`);
    yield page.waitForSelector("#lbstuUID");
    const studentName = yield page.$eval("#ContentPlaceHolder1_lblName", (el) => { var _a; return ((_a = el.textContent) === null || _a === void 0 ? void 0 : _a.trim()) || ""; });
    const studentUID = yield page.$eval("#lbstuUID", (el) => { var _a; return ((_a = el.textContent) === null || _a === void 0 ? void 0 : _a.trim()) || ""; });
    yield page.goto(`https://students.cuchd.in/frmMyTimeTable.aspx`);
    yield page.waitForSelector("#ContentPlaceHolder1_grdMain");
    const timetableArray = yield page.$$eval("#ContentPlaceHolder1_grdMain tr", (rows) => {
        return rows.map((row) => {
            const cells = Array.from(row.querySelectorAll("td, th"));
            return cells.map((cell) => { var _a; return ((_a = cell === null || cell === void 0 ? void 0 : cell.textContent) === null || _a === void 0 ? void 0 : _a.trim()) || ""; });
        });
    });
    const timetableObj = (0, buildTimetable_1.buildTimetable)(timetableArray);
    res.json({ UID: studentUID, Name: studentName, Timetable: timetableObj });
    // Optionally close the session after use
    yield browser.close();
    sessions.delete(sessionId); // Clean up the session
    console.log("Session closed and removed");
}));
exports.lmsapiRouter.get("/", [startSession, getCaptcha], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.send(res.locals.session);
    console.log("captured captcha please respond with post.");
}));
exports.lmsapiRouter.post("/", [submitCaptcha], (req, res) => {
    console.log("Finished getting student details and shit");
    res.send({
        msg: "Donezo"
    });
});
function startSession(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const sessionId = (0, uuid_1.v4)(); // Generate a random sessionId using UUID
        const { browser, page } = yield (0, createBrowserAndPage_1.default)();
        // Store browser and page instance in the sessions map
        sessions.set(sessionId, { browser, page });
        console.log(`Session started for: ${sessionId}`);
        res.locals.session = sessionId;
        next();
        // res.json({ sessionId, message: `Session started for ${sessionId}` });
    });
}
function getCaptcha(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { sessionId, userId, password } = req.body;
        const session = sessions.get(res.locals.session);
        if (!session) {
            return res.status(400).json({ error: "Session not found" });
        }
        const { page } = session;
        yield page.goto(`https://students.cuchd.in/`);
        yield page.type("#txtUserId", userId);
        yield page.click("#btnNext");
        yield page.waitForNavigation();
        yield page.type("#txtLoginPassword", password);
        yield page.waitForSelector("#imgCaptcha");
        const captchaElement = yield page.$("#imgCaptcha");
        const captchaBuffer = yield (captchaElement === null || captchaElement === void 0 ? void 0 : captchaElement.screenshot());
        yield (captchaElement === null || captchaElement === void 0 ? void 0 : captchaElement.screenshot({ path: "captcha.png" }));
        console.log("Captcha sent to client");
        next();
    });
}
function submitCaptcha(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { sessionId, captcha } = req.body;
        const session = sessions.get(sessionId);
        if (!session) {
            return res.status(400).json({ error: "Session not found" });
        }
        const { page, browser } = session;
        yield page.type("#txtcaptcha", captcha);
        yield page.click("#btnLogin");
        yield page.waitForNavigation();
        yield page.goto(`https://students.cuchd.in/frmStudentProfile.aspx`);
        yield page.waitForSelector("#lbstuUID");
        const studentName = yield page.$eval("#ContentPlaceHolder1_lblName", (el) => { var _a; return ((_a = el.textContent) === null || _a === void 0 ? void 0 : _a.trim()) || ""; });
        const studentUID = yield page.$eval("#lbstuUID", (el) => { var _a; return ((_a = el.textContent) === null || _a === void 0 ? void 0 : _a.trim()) || ""; });
        yield page.goto(`https://students.cuchd.in/frmMyTimeTable.aspx`);
        yield page.waitForSelector("#ContentPlaceHolder1_grdMain");
        const timetableArray = yield page.$$eval("#ContentPlaceHolder1_grdMain tr", (rows) => {
            return rows.map((row) => {
                const cells = Array.from(row.querySelectorAll("td, th"));
                return cells.map((cell) => { var _a; return ((_a = cell === null || cell === void 0 ? void 0 : cell.textContent) === null || _a === void 0 ? void 0 : _a.trim()) || ""; });
            });
        });
        const timetableObj = (0, buildTimetable_1.buildTimetable)(timetableArray);
        res.json({ UID: studentUID, Name: studentName, Timetable: timetableObj });
        // Optionally close the session after use
        yield browser.close();
        sessions.delete(sessionId); // Clean up the session
        console.log("Session closed and removed");
    });
}
