import express from "express";
import cors from "cors";
import { lmsapiRouter } from "./routes/lmsapiRouter";
import { User } from "./db/user";

const app = express();
app.use(express.json());
app.use(cors());

interface UserInterface{
  uid : string,
  password : string,
  email? : string
}

app.get("/", (req,res) => {
  res.json({
    msg: "Hello"
  })
});

app.use("/lmsapi", lmsapiRouter);

app.listen(3000, () => {
  console.log("server started on 3000");
})

