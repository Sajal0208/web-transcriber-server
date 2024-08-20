import Agenda from "agenda";
import { JobHandler } from "../handler";

export const deleteFileDefinition = async (agenda: Agenda) => {
  await agenda.start();
  agenda.define("delete-file", JobHandler.deleteFile);
};
