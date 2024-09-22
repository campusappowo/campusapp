import express from "express";

const app = express();

const PORT = 4000;

app.get("/hello", (request, response) => {
  response.json({ message: "hello", status: "200" });
});

app.listen(PORT, () => {
  console.log(`Running on port: ${PORT}`);
});
