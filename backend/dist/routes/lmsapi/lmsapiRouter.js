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
const dotenv_1 = require("dotenv");
const db_1 = require("../../db/db");
const getDetails_1 = require("./lmsapiHelpers/getDetails");
const jsonwebtoken_1 = require("jsonwebtoken");
const cloudinary_1 = require("cloudinary");
exports.lmsapiRouter = express_1.default.Router();
const sessions = new Map();
(0, dotenv_1.config)();
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
});
const baseUrl = process.env.BASE_URL || "";
const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
exports.lmsapiRouter.use("/*", (req, res, next) => {
    const authHeaders = req.headers.authorization;
    if (!authHeaders) {
        return res.send("Not logged in");
    }
    const token = authHeaders.split(' ')[1];
    const payload = (0, jsonwebtoken_1.verify)(token, process.env.JWT_SECRET || 'SECRET');
    res.payload = payload;
    next();
});
// ONE SINGLE Route to send UID,PASSWORD to,  will send session id as a response and deliver a captcha.
// ALSO updates User collection in getCaptcha middleware.
exports.lmsapiRouter.get("/", [startSession, getCaptcha], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("captured captcha please respond with post.");
    res.send({
        session: res.session,
        captchaUrl: res.captchaUrl
    });
}));
// ONE SINGLE Route to POST, send session ID and captcha to LOGIN, get your timetable and student detials.
// also update timetable collection.
exports.lmsapiRouter.post("/", [submitCaptcha], (req, res) => {
    console.log("Finished getting student details and shit");
    const today = dayNames[new Date().getDay()];
    const tt = res.Timetable;
    const timeTable = {
        day: today,
        schedule: (tt[today])
    };
    res.send({
        user: {
            uid: res.UID,
            name: res.Name
        },
        timeTable: timeTable
    });
});
// Start Session Middleware, to create a new browser session for each user.
function startSession(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const sessionId = (0, uuid_1.v4)(); // Generate a random sessionId using UUID
        const { browser, page } = yield (0, createBrowserAndPage_1.default)();
        // Store browser and page instance in the sessions map
        sessions.set(sessionId, { browser, page });
        console.log(`Session started for: ${sessionId}`);
        res.session = sessionId; // store sessionID to use in the next middleware
        next();
    });
}
// Get captcha middleware, to get captcha delivered, uses userId and Password.
function getCaptcha(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { userId, password } = res.payload;
        const session = sessions.get(res.session); // Getting Session directly from a res variable that we stored in the prev middleware, i.e startSession
        if (!session) {
            return res.status(400).json({ error: "Session not found" });
        }
        const { page } = session;
        yield page.goto(`${baseUrl}`);
        yield page.type("#txtUserId", userId);
        yield page.click("#btnNext");
        yield page.waitForNavigation();
        yield page.type("#txtLoginPassword", password);
        yield page.waitForSelector("#imgCaptcha");
        const captchaElement = yield page.$("#imgCaptcha");
        yield (captchaElement === null || captchaElement === void 0 ? void 0 : captchaElement.screenshot({ path: "captcha.png" }));
        console.log("Captcha sent to client");
        const captchaUrl = yield cloudinary_1.v2.uploader.upload("captcha.png");
        res.captchaUrl = captchaUrl.url;
        next();
    });
}
// submit captcha middleware, updates timetable and shit
// TODO : DEAL WITH WRONG CAPTCHA AND/OR WRONG ID PASSWORD
function submitCaptcha(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("IN SUBMIT CAPTCHA" + res.payload);
        const { userId, password } = res.payload;
        const { sessionId, captcha } = req.body;
        const session = sessions.get(sessionId);
        if (!session) {
            return res.status(400).json({ error: "Session not found" });
        }
        const { page, browser } = session;
        const { studentName, studentUID, timetableObj } = yield (0, getDetails_1.getDetails)(page, captcha, baseUrl);
        res.UID = studentUID;
        res.Name = studentName;
        res.Timetable = timetableObj;
        const user = yield db_1.User.findOne({
            uid: studentUID
        });
        if (user) {
            console.log("user found");
            // WHAT TO DO IF STUDENT ALREADY EXISTS
        }
        else {
            console.log("user not found");
            const newUser = new db_1.User({
                uid: studentUID,
                password: password,
                name: studentName,
                timetable: timetableObj
            });
            yield newUser.save();
            console.log("new time table saved for " + studentUID);
        }
        // Optionally close the session after use
        yield browser.close();
        sessions.delete(sessionId); // Clean up the session
        console.log("Session closed and removed");
        next();
    });
}
