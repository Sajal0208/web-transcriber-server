import { existsSync } from "fs";
import { DEFAULT_MODEL, MODEL_OBJECT } from "../constant";
import BadRequestError from "../errors/BadRequestError";
import path from "path";
import NotFoundError from "../errors/NotFoundError";

type CppCommandTypes = {
  filePath: string;
  modelName?: string;
  modelPath?: string;
  options?: IFlagTypes;
};

export type IFlagTypes = {
  gen_file_txt?: boolean;
  gen_file_subtitle?: boolean;
  gen_file_vtt?: boolean;
  timestamp_size?: number;
  word_timestamps?: boolean;
  language?: string;
};

export const createCommand = ({
  filePath,
  modelName = null,
  modelPath = null,
  options = null,
}: CppCommandTypes) =>
  `./main ${getFlags(options)} -m ${modelPathOrName(
    modelName,
    modelPath
  )} -f ${filePath}`;

const modelPathOrName = (mn: string, mp: string) => {
  if (mn && mp) {
    throw new BadRequestError({
      message: "Submit a modelName OR a modelPath. NOT BOTH!",
      context: { modelName: mn, modelPath: mp },
    });
  } else if (!mn && !mp) {
    const modelPath = path.join(
      __dirname,
      "..",
      "..",
      "models",
      MODEL_OBJECT[mn]
    );

    if (!existsSync(modelPath)) {
      throw new NotFoundError({
        message: `'${DEFAULT_MODEL}' not downloaded! Run 'npx whisper-node download'`,
        context: { defaultModel: DEFAULT_MODEL },
      });
    }

    return modelPath;
  } else if (mp) return mp;
  else if (MODEL_OBJECT[mn]) {
    const modelPath = path.join(
      __dirname,
      "..",
      "..",
      "models",
      MODEL_OBJECT[mn]
    );

    if (!existsSync(modelPath)) {
      throw new NotFoundError({
        message: `'${mn}' not found! Run 'npx whisper-node download'`,
        context: { modelName: mn },
      });
    }

    return modelPath;
  } else if (mn) {
    throw new BadRequestError({
      message: `modelName "${mn}" not found in list of models. Check your spelling OR use a custom modelPath.`,
      context: { modelName: mn },
    });
  } else {
    throw new BadRequestError({
      message: `modelName OR modelPath required! You submitted modelName: '${mn}', modelPath: '${mp}'`,
      context: { modelName: mn, modelPath: mp },
    });
  }
};

const getFlags = (flags: IFlagTypes): string => {
  let s = "";

  if (flags.timestamp_size && flags.word_timestamps) {
    throw new BadRequestError({
      message:
        "Invalid option pair. Use 'timestamp_size' OR 'word_timestamps'. NOT BOTH!",
      context: {
        timestamp_size: flags.timestamp_size,
        word_timestamps: flags.word_timestamps,
      },
    });
  }

  // output files
  if (flags.gen_file_txt) s += " -otxt";
  if (flags.gen_file_subtitle) s += " -osrt";
  if (flags.gen_file_vtt) s += " -ovtt";
  // timestamps
  if (flags.timestamp_size && flags.word_timestamps)
    throw "Invalid option pair. Use 'timestamp_size' OR 'word_timestamps'. NOT BOTH!";
  if (flags.word_timestamps) s += " -ml 1"; // shorthand for timestamp_size:1
  if (flags.timestamp_size) s += " -ml " + String(flags.timestamp_size);
  // input language
  if (flags.language) s += " -l " + flags.language;

  return s;
};
