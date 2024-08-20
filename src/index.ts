import app from "./app";

const initServer = () => {
  app.listen(4000, () => {
    console.log("Server is running on port 4000");
  });
};

initServer();
