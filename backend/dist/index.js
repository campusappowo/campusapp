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
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const lmsapiRouter_1 = require("./routes/lmsapiRouter");
const user_1 = require("./db/user");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.get("/", (req, res) => {
    res.json({
        msg: "Hello"
    });
});
app.post("/test", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { uid, password } = req.body;
    const email = uid + "@cuchd.in";
    const user = yield user_1.User.create({
        uid,
        password,
        email
    });
    console.log(user);
    if (user)
        res.status(200).json({ msg: "Successfully created user" });
    else
        res.status(500).json({ msg: "Some error occured" });
}));
app.get("/test", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield user_1.User.find();
    users.map(user => {
        console.log(user);
    });
    res.json({ msg: "successfully returned users" });
}));
app.use("/lmsapi", lmsapiRouter_1.lmsapiRouter);
app.listen(3000, () => {
    console.log("server started on 3000");
});
