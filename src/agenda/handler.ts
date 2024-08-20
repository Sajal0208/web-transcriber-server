import fs from "fs";
import path from "path";

const createFilePath = (fileName: string, format: string) => {
  const ogFileName = fileName.split(".")[0];
  const newFileName = `${ogFileName}.${format}`;
  const newPath = path.join(__dirname, "..", "uploads", newFileName);
  return newPath;
};

export const JobHandler = {
  deleteFile: async (job: any, done: any) => {
    try {
      const { fileName } = job.attrs.data;
      const ogFileName = fileName.split(".")[0];

      const uploadDir = path.join(__dirname, "..", "uploads");
      const files = fs.readdirSync(uploadDir);

      files.forEach((file) => {
        if (file.startsWith(ogFileName)) {
          const filePath = path.join(uploadDir, file);
          fs.unlinkSync(filePath);
          console.log(`Deleted file: ${filePath}`);
        }
      });

      done();
    } catch (error) {
      console.error(`Error deleting files: ${error}`);
      done(error);
    }
  },
};
