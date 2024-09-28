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
exports.lmsapiRouter = express_1.default.Router();
const sessions = new Map();
exports.lmsapiRouter.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const sessionId = (0, uuid_1.v4)(); // Generate a random sessionId using UUID
    const { browser, page } = yield (0, createBrowserAndPage_1.default)();
    // Store browser and page instance in the sessions map
    sessions.set(sessionId, { browser, page });
    console.log(`Session started for: ${sessionId}`);
    res.json({ sessionId, message: `Session started for ${sessionId}` });
}));
exports.lmsapiRouter.get("/captcha", (req, res) => {
    const { username, password } = req.body();
});
