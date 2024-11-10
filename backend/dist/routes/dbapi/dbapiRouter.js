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
exports.dbRouter = void 0;
const express_1 = __importDefault(require("express"));
const db_1 = require("../../db/db");
const jsonwebtoken_1 = require("jsonwebtoken");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
exports.dbRouter = express_1.default.Router();
const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
exports.dbRouter.use("/*", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const authHeaders = req.headers.authorization;
    if (!authHeaders) {
        return res.send({
            msg: "not logged in desu"
        });
    }
    const token = authHeaders.split(' ')[1];
    const payload = (0, jsonwebtoken_1.verify)(token, process.env.JWT_SECRET || 'SECRET');
    res.payload = payload;
    next();
}));
exports.dbRouter.get("/details", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const today = dayNames[new Date().getDay()];
    const user = yield db_1.User.findOne({
        uid: res.payload.userId
    });
    if (user) {
        const timeTable = {
            day: today,
            // @ts-expect-error
            schedule: (user.timetable[today])
        };
        res.json({ user, timeTable });
    }
    else {
        res.json({ user: "EMPTY" });
    }
}));
