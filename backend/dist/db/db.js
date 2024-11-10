"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const { Schema } = mongoose_1.default;
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
mongoose_1.default.connect(process.env.MONGO_DB_URL || "");
const userSchema = new Schema({
    uid: String,
    email: { type: String, required: false },
    password: String,
    name: String,
    timetable: {
        Mon: {
            type: Map,
            of: String
        },
        Tue: {
            type: Map,
            of: String
        },
        Wed: {
            type: Map,
            of: String
        },
        Thu: {
            type: Map,
            of: String
        },
        Fri: {
            type: Map,
            of: String
        },
        Sat: {
            type: Map,
            of: String
        },
        Sun: {
            type: Map,
            of: String
        }
    }
});
exports.User = mongoose_1.default.model("User", userSchema);
