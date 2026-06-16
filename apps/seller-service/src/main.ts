import "dotenv/config" 
import express from 'express';
import cookieParser from "cookie-parser"
import { errorMiddleware } from '@packages/error-handler/error-middleware';
import router from "./routes/seller.routes";

const app = express();
app.use(express.json())
app.use(cookieParser())

app.get('/', (req, res) => {
  res.send({ message: 'Hello API' });
});


//Routes
app.use("/api", router)
app.use(errorMiddleware)

const port = process.env.PORT || 6007;
const server = app.listen(port, () => {
  console.log(`seller service is running at http://localhost:${port}/api`);
});
server.on('error', console.error);
