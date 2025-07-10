// @ts-ignore
import express from 'express'
import router from './routes/api'
import bodyParser from "body-parser";

const PORT = 3000;
const app = express();

app.use(bodyParser.json())
app.use('/api', router)

app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`)
})