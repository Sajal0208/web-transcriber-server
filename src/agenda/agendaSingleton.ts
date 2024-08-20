import Agenda from "agenda";
import allDefinitions from "./definitions/index";
import path from "path";
const envPath = path.join(__dirname, "..", "..", ".env");
require("dotenv").config({ path: envPath });

const agenda = new Agenda({
  db: {
    address: process.env.MONGO_URI!,
    collection: "agendaJobs",
  },
  processEvery: "40 seconds",
});

// listen for the ready or error event.
agenda
  .on("ready", () => console.log("Agenda started!"))
  .on("error", () => console.log("Agenda connection error!"));

// define all agenda jobs
allDefinitions(agenda);

export default agenda;
