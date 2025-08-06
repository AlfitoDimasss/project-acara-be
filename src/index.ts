// @ts-ignore
import express from "express";
import router from "./routes/api";
import bodyParser from "body-parser";
import connect from "./utils/database";
import docs from "./docs/route";
import cors from "cors";
import {sendResponse} from "./utils/sendResponse";

async function init() {
    try {
        const result = await connect();
        console.log(`DB Status: ${result}`);

        const PORT = 3000;
        const app = express();

        app.use(cors());
        app.use(bodyParser.json());

        app.get("/", (req, res) => {
            sendResponse(res, 200, "Server is running");
        });

        app.use("/api", router);
        docs(app);

        app.listen(PORT, () => {
            console.log(`Server listening on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error(error);
    }
}

init();
