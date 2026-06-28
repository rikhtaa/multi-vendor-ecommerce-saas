import express from 'express';
import cookieParser from "cookie-parser"
import router from './routes/recommendation-route';

const app = express();
app.use(express.json({limit: "100mb"}))
app.use(express.urlencoded({limit: "100mb", extended: true}))
app.use(cookieParser())


app.get('/', (req, res) => {
  res.send({ message: 'Welcome to recommendation-service!' });
});

//Routes
app.use("/api", router)


const port = process.env.PORT || 6009;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);
