import mongoose from "mongoose";
const { Schema } = mongoose

mongoose.connect("mongodb://localhost:27018/campusapp")

const userSchema = new Schema({
    uid : String,
    email : String,
    password : String
})

export const User = mongoose.model("User", userSchema);