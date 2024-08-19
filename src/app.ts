import express from "express";
import { json } from "body-parser";
import { errorHandler } from "./middlewares/errors";
import transcribeRouter from "./route";

const app = express();

app.use(json());

app.use("/api", transcribeRouter);
app.get("/", (req, res) => {
  res.send("Hello World");
});

app.use(errorHandler);

export default app;
