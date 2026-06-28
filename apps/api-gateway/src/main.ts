import express from 'express';
import cors from "cors"
import proxy from "express-http-proxy" 
import morgan from "morgan" 
import cookieParser from "cookie-parser"
import initializeSiteConfig from './libs/initializeSiteConfig';

const app = express()

app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"],
  allowedHeaders: ["Authorization", "Content-Type"],
  credentials: true
}))

app.use(morgan("dev"))
app.use(express.json({limit: "100mb"}))
app.use(express.urlencoded({limit: "100mb", extended: true}))
app.use(cookieParser())
app.set("trust proxy", 1)

const forwardCookies = (proxyReqOpts: any, srcReq: any) => {
  proxyReqOpts.headers = proxyReqOpts.headers || {}
  proxyReqOpts.headers["cookie"] = srcReq.headers["cookie"] || ""
  return proxyReqOpts
}

app.get('/gateway-health', (req, res) => {
  res.send({ message: 'Welcome to api-gateway!' });
});

app.use("/product", proxy("http://localhost:6002", {
  proxyReqPathResolver: (req) => req.originalUrl.replace("/product", ""),
  proxyReqOptDecorator: forwardCookies  
}))

app.use("/order", proxy("http://localhost:6004", {
  proxyReqPathResolver: (req) => req.originalUrl.replace("/order", ""),
  proxyReqOptDecorator: forwardCookies  
}))

app.use("/admin", proxy("http://localhost:6005", {
  proxyReqPathResolver: (req) => req.originalUrl.replace("/admin", ""),
  proxyReqOptDecorator: forwardCookies  
}))
app.use("/chatting", proxy("http://localhost:6006"))
app.use("/seller", proxy("http://localhost:6007", {
  proxyReqPathResolver: (req) => req.originalUrl.replace("/seller", ""),
  proxyReqOptDecorator: forwardCookies  
}))
app.use("/recommendation", proxy("http://localhost:6009", {
  proxyReqPathResolver: (req) => req.originalUrl.replace("/recommendation", ""),
  proxyReqOptDecorator: forwardCookies  
}))

app.use("/", proxy("http://localhost:6001", {
  proxyReqOptDecorator: forwardCookies  
}))

const port = process.env.PORT || 8080;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
  try {
    initializeSiteConfig()
    console.log("Site config initialized successfully!")
  } catch (error) {
    console.log("Failed to initialize site config:", error)
  }
});
server.on('error', console.error);