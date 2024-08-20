import { Router } from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import BadRequestError from "./errors/BadRequestError";
import { getModels } from "./controllers/models";
import { convertToWavType } from "./services/convert-to-wav";
import { createCommand } from "./controllers/whisper";
import whisper from "./services/whisper-shell";
import { IncomingForm } from "formidable";
import InternalServerError from "./errors/InternalServerError";

const router = Router();

export type IFlagTypes = {
  gen_file_txt?: boolean;
  gen_file_subtitle?: boolean;
  gen_file_vtt?: boolean;
};

function getAbsolutePath(relativePath: string): string {
  return path.resolve(process.cwd(), relativePath);
}

const uploadFolder = path.join(__dirname, "..", "uploads");

router.post("/transcribe", async (req, res, next) => {
  let outputFilePath = "";
  let inputFilePath = "";
  let modelName = "";
  let options: IFlagTypes = {};
  let newFileName = "";
  try {
    const customOptions = {
      uploadDir: uploadFolder,
      keepExtensions: true,
      allowEmptyFiles: false,
      maxFileSize: 5 * 1024 * 1024 * 1024 * 1024,
    };
    const form = new IncomingForm(customOptions);

    form.parse(req, async function (err: any, fields: any, files: any) {
      if (err) {
        console.log(err, "err");
        console.log("Error parsing the files");
        return res.status(400).json({
          status: "Fail",
          message: "There was an error parsing the files",
          error: err,
        });
      }
      const file = files.audio[0];
      const fileExtension = path.extname(file.filepath);
      newFileName = `${Date.now()}${fileExtension}`;
      const newFilePath = path.join(uploadFolder, newFileName);
      fs.renameSync(file.filepath, newFilePath);

      inputFilePath = newFilePath;
      modelName = fields.modelName[0];
      options = fields.options;
      outputFilePath = await convertToWavType(inputFilePath, false);
      const transcriptionOptions = JSON.parse(fields.options[0]);

      if (!outputFilePath) {
        return next(
          new BadRequestError({
            message: "Failed to convert file to wav",
          })
        );
      }

      const command = createCommand({
        filePath: outputFilePath,
        modelName,
        options: transcriptionOptions,
      });

      const stream = await whisper(command);

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      stream.on("data", (chunk) => {
        res.write(chunk);
      });

      stream.on("end", () => {
        res.write(JSON.stringify({ id: newFileName }));
        res.end();
      });

      stream.on("error", (error) => {
        next(new InternalServerError({ message: error.message }));
      });
    });
  } catch (error) {
    console.error(error);
    next(error);
  } finally {
    if (outputFilePath) {
      fs.unlinkSync(outputFilePath);
    }
    if (inputFilePath) {
      fs.unlinkSync(inputFilePath);
    }
  }
});

router.get("/download/:id/:format", async (req, res, next) => {
  console.log(req.params);
  const id = req.params.id;
  const format = req.params.format;
  const [fileId, _] = id.split(".");
  const filename = `${fileId}.wav.${format}`;
  const filePath = path.join(uploadFolder, filename);
  res.download(filePath, filename, (err) => {
    if (err) {
      res.send({
        error: err,
        msg: "Problem downloading the file",
      });
    }
  });
});

router.get("/models", async (req, res, next) => {
  try {
    const models = await getModels();
    res.json({
      error: null,
      models,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

export default router;
