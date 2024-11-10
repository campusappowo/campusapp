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
const lmsapiRouter_1 = require("./routes/lmsapi/lmsapiRouter");
const db_1 = require("./db/db");
const dotenv_1 = require("dotenv");
const dbapiRouter_1 = require("./routes/dbapi/dbapiRouter");
const jsonwebtoken_1 = require("jsonwebtoken");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: ["http://localhost:5173"],
    allowedHeaders: ["Authorization", "Content-Type"],
    credentials: true
}));
(0, dotenv_1.config)();
const PORT = process.env.PORT || 3000;
app.get("/", (req, res) => {
    res.json({
        msg: "Hello"
    });
});
app.use("/lmsapi", lmsapiRouter_1.lmsapiRouter);
app.use("/dbapi", dbapiRouter_1.dbRouter);
// ONLY DUMMY ENDPOINT FOR NOW, ADD ACTUAL LOGIC.
// I WAS THINKING -> IF USERID AND PASSWORD EXISTS WE SEND THEM TO DBAPI FOR GETTING THEIR DATA FROM DB WAISA KUCH
app.post("/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, password } = req.body;
    const user = yield db_1.User.findOne({
        uid: userId
    });
    if (user) {
        if (password === user.password) {
            const token = (0, jsonwebtoken_1.sign)({ userId: user.uid, password: password }, process.env.JWT_SECRET || 'SECRET');
            return res.json({
                jwt: token
            });
        }
        else {
            res.status(404).send("Wrong password");
        }
    }
    else {
        res.status(411).send("User doesnt exist please signin");
    }
}));
// ONLY DUMMY ENDPOINT FOR NOW, ADD ACTUAL LOGIC
// I WAS THINKING -> WE GOTTA SEND THEM TO LMSAPI WITH THIS, GONNA BE A BIT TOUGHER? WILL HAVE TO SEE KYA KARNA HAI CUZ
// HMMMMMMMMMMM WE CANT SEND BODY DATA FROM THIS POST TO ANOTHER POST/GET THAT IS THE POST OF "/lmsapi/"
// SO KAISE WE'LL FETCH THAT DATA :///
app.post("/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, password } = req.body;
    const user = yield db_1.User.findOne({
        uid: userId
    });
    if (user) {
        res.status(303).send('User already exists pls signin');
    }
    else {
        const token = (0, jsonwebtoken_1.sign)({ userId: userId, password: password }, process.env.JWT_SECRET || 'SECRET');
        return res.json({
            jwt: token
        });
    }
}));
app.listen(PORT, () => {
    console.log(`server started on ${PORT}`);
});
