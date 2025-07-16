// @ts-ignore
import express from "express";
import router from "./routes/api";
import bodyParser from "body-parser";
import connect from "./utils/database";

async function init() {
  try {
    const result = await connect();
    console.log(`DB Status: ${result}`);

    const PORT = 3000;
    const app = express();

    app.use(bodyParser.json());

    app.get("/", (req, res) => {
      res.status(200).json({
        message: "Server is running",
        data: null,
      });
    });

    app.use("/api", router);

    app.listen(PORT, () => {
      console.log(`Server listening on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error(error);
  }
}

init();
