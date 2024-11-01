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

// ONLY DUMMY ENDPOINT FOR NOW, ADD ACTUAL LOGIC.
// I WAS THINKING -> IF USERID AND PASSWORD EXISTS WE SEND THEM TO DBAPI FOR GETTING THEIR DATA FROM DB WAISA KUCH
app.post("/signin", async (req,res) => {
  const {userId, password} : {userId : string, password : string} = req.body;

  const user = await User.findOne({
    uid : userId
  });

  if(user) {
    if (password === user.password){
      res.send("successful login");
    }
    else {
      res.send("Wrong password");
    }
  }
  else {
    res.send("User doesnt exist please signin");
  }
})

// ONLY DUMMY ENDPOINT FOR NOW, ADD ACTUAL LOGIC
// I WAS THINKING -> WE GOTTA SEND THEM TO LMSAPI WITH THIS, GONNA BE A BIT TOUGHER? WILL HAVE TO SEE KYA KARNA HAI CUZ
// HMMMMMMMMMMM WE CANT SEND BODY DATA FROM THIS POST TO ANOTHER POST/GET THAT IS THE POST OF "/lmsapi/"
// SO KAISE WE'LL FETCH THAT DATA :///
app.post("/signup",async (req,res) => {
  const {userId, password} : {userId : string, password : string} = req.body;

  const user = await User.findOne({
    uid : userId
  });

  if(user){
    res.send('User already exists pls signin');
  }
  else {
    res.send("");
    // TODO ADD LOGIN FOR SIGNING UP
  }
})


app.listen(PORT, () => {
  console.log(`server started on ${PORT}`);
})

