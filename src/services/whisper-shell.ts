import path from "path";
import shell from "shelljs";
import InternalServerError from "../errors/InternalServerError";

const WHISPER_CPP_PATH = path.join(__dirname, "..", "..", "lib");
const WHISPER_CPP_MAIN_PATH = "./main";

export interface IShellOptions {
  silent: boolean;
  async: boolean;
}

const defaultShellOptions = {
  silent: false,
  async: true,
};

export default async function whisper(
  command: string,
  options: IShellOptions = defaultShellOptions
): Promise<NodeJS.ReadableStream> {
  return await new Promise(async (resolve, reject) => {
    try {
      const child = shell.exec(command, { ...options, async: true });

      if (!child.stdout) {
        reject(new InternalServerError({ message: "No stdout available" }));
        return;
      }

      resolve(child.stdout);
    } catch (error) {
      reject(new InternalServerError({ message: error.message }));
    }
  });
}

try {
  // shell.cd(__dirname + WHISPER_CPP_PATH);
  shell.cd(WHISPER_CPP_PATH);
  // ensure command exists in local path
  if (!shell.which(WHISPER_CPP_MAIN_PATH)) {
    shell.echo(
      "[whisper-node] Problem. whisper.cpp not initialized. Current shelljs directory: ",
      __dirname
    );
    shell.echo(
      "[whisper-node] Attempting to run 'make' command in /whisper directory..."
    );

    // todo: move this
    shell.exec("make", defaultShellOptions);

    if (!shell.which(WHISPER_CPP_MAIN_PATH)) {
      console.log(
        "[whisper-node] Problem. 'make' command failed. Please run 'make' command in /whisper directory. Current shelljs directory: ",
        __dirname
      );
      process.exit(1);
    } else
      console.log(
        "[whisper-node] 'make' command successful. Current shelljs directory: ",
        __dirname
      );
  }
} catch (error) {
  console.log("error caught in try catch block");
  throw error;
}
