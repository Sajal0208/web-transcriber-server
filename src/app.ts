import express from "express";
import bodyParser from "body-parser";
import { errorHandler } from "./middlewares/errors";
import transcribeRouter from "./route";
import cors from "cors";

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  cors({
    origin: "http://localhost:3000",
  })
);

app.use("/api", transcribeRouter);
app.get("/", (req, res) => {
  res.send("Hello World");
});

app.use(errorHandler);

export default app;
