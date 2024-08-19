import { Router } from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import BadRequestError from "./errors/BadRequestError";

const router = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

export type IFlagTypes = {
  gen_file_txt?: boolean;
  gen_file_subtitle?: boolean;
  gen_file_vtt?: boolean;
  timestamp_size?: number;
  word_timestamps?: boolean;
  language?: string;
};

router.post("/transcribe", async (req, res, next) => {});

router.get("/models", (req, res) => {
  res.json({});
});

router.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

export default router;
