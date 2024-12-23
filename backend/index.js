import express from "express";
import ImageKit from "imagekit";
import cors from 'cors';
import Chat from '../models/chat.js';
import userChats from '../models/userChats.js';


const port = process.env.PORT || 3000;
const app = express();

import dotenv from "dotenv";
import mongoose from 'mongoose';

dotenv.config();

 app.use(cors({
      origin: process.env.CLIENT_URL,
}))

app.use(express.json());

const connect = async()=>{
     try{
          await Mongoose.connect(process.env.MONGO)
          console.log("Connected to MongoDb");
     }catch(err){
          console.log(err);
     }
}

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
app.post("/api/chats",async(req, res)=>{
     const {userId, text} = req.body;

     try{
          // CREATE A NEW CHAT     
          const newChat = new Chat({
               userId:userId, 
               history:[{role:"user",parts:[{text}]}],
          });
     const savedChat = await newChat.save();
     // CHECK IF THE USERCHATS EXIST
     const userChats = await userChats.find({userId:userId});
     // IF DOESN'T EXIST CREATE A NEW ONE AND ADD THE CHAT IN THE CHATS ARRAY
     if(!userChats.length){
          const newUserChats = new userChats({
               userId: userId,
               chats:[
                    {
                         _id: savedChat.id,
                         title: text.substring(0,40),

                    },
               ],
          });
     await newUserChats.save();
     }else{
          // IF EXISTS PUSH THE CHAT TO THE EXISING ARRAY
          await userChats.updateOne({userId:userId},{
               $push:{
                    chats: {
                         _id: savedChat._id,
                         title: text.substring(0,40),
                    }
               }
          })

          res.status(201).send(newChat._id);
     }
     }catch(err){
          console.log(err);
          res.status(500).send("Error creating chat!")
     }
})

app.listen(port,()=>{
    console.log(`Server Running on port - ${port}`);
})