"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const lmsapiRouter_1 = require("./routes/lmsapiRouter");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.get("/", (req, res) => {
    res.json({
        msg: "Hello"
    });
});
app.use("/lmsapi", lmsapiRouter_1.lmsapiRouter);
app.listen(3000, () => {
    console.log("server started on 3000");
});
