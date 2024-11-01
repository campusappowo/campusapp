import express from "express";
import cors from "cors";
import { lmsapiRouter } from "./routes/lmsapi/lmsapiRouter";
import { User } from "./db/db";
import { dbRouter } from "./routes/dbapi/dbapiRouter";

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3000;

app.get("/", (req,res) => {
  res.json({
    msg: "Hello"
  })
});

app.use("/lmsapi", lmsapiRouter);
app.use("/dbapi", dbRouter);


app.listen(PORT, () => {
  console.log(`server started on ${PORT}`);
})

