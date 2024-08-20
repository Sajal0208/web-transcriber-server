import Agenda from "agenda";
import { deleteFileDefinition } from "./deleteFileDefinition";

const definitions = [deleteFileDefinition];

export default function allDefinitions(agenda: Agenda) {
  definitions.forEach((definition) => definition(agenda));
}
