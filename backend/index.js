import express from "express";
import ImageKit from "imagekit";
import cors from 'cors';

const port = process.env.PORT || 3000;
const app = express();

import dotenv from "dotenv";

dotenv.config();

 app.use(cors({
      origin: process.env.CLIENT_URL,
}))
const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

app.use(function(req, res, next) {
     res.header("Access-Control-Allow-Origin", "*");
     res.header("Access-Control-Allow-Headers", 
       "Origin, X-Requested-With, Content-Type, Accept");
     next();
});

app.get("/",(req, res)=>{
     res.send("root path");
})
app.get("/api/upload",(req, res)=>{
     const result = imagekit.getAuthenticationParameters();
     res.send(result);
})

app.listen(port,()=>{
    console.log(`Server Running on port - ${port}`);
})