import express from "express";
import ImageKit from "imagekit";
import cors from 'cors';
import Chat from './models/chat.js';
// Change in model import
import UserChats from "./models/userChats.js"; // Capital U
//import UserChats from './models/userChats.js';
import dotenv from "dotenv";
import mongoose from "mongoose";
import { requireAuth } from '@clerk/express';



const port = process.env.PORT || 8080;

const app = express();

dotenv.config();

app.use(cors({
     origin: 'http://localhost:5173', // Your Vite frontend URL
     credentials: true,
     methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
     allowedHeaders: ['Content-Type', 'Authorization']
})); 

app.use(express.json());

const connect = async () => {
     try {
       await mongoose.connect(process.env.MONGO);
       console.log("Connected to MongoDB");
     } catch (err) {
       console.log(err);
     }
};


const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

app.get("/",(req, res)=>{
     res.send("root path");
})
app.get("/api/upload",(req, res)=>{
     const result = imagekit.getAuthenticationParameters();
     res.send(result);
})
app.get("/api/userchats", requireAuth(), async (req, res) => {
     const userId = req.auth.userId;
     try {
       const userChats = await UserChats.find({ userId });
       console.log("Fetched user chats:", userChats);
       if (userChats.length > 0) {
         res.status(200).send(userChats[0].chats);
       } else {
         res.status(200).send([]);
       }
     } catch (err) {
       console.log("Error fetching user chats:", err);
       res.status(500).send("Error fetching userchats!");
     }
   });
app.get("/api/chats/:id",requireAuth(),async(req, res)=>{
     const userId=req.auth.userId;
     try{
          const chat = await Chat.findOne({_id: req.params.id, userId});
          //console.log(UserChats);
          res.status(200).send(chat);
     }catch(err){
          console.log(err);
          res.status(500).send("Error fetching chat!")
     }
});

app.post("/api/chats",requireAuth(),async(req, res)=>{
     const {userId, text} = req.body;
     try{
          // CREATE A NEW CHAT     
          const newChat = new Chat({
               userId:userId, 
               history:[{role:"user",parts:[{text}]}],
          });
     const savedChat = await newChat.save();
     // CHECK IF THE USERCHATS EXIST
     const UserChat = await UserChat.find({userId:userId});
     // IF DOESN'T EXIST CREATE A NEW ONE AND ADD THE CHAT IN THE CHATS ARRAY
     if(!UserChat.length){
          const newUserChats = new UserChats({
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
          await UserChat.updateOne({userId:userId},{
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

app.use((err, req, res, next)=>{
     console.error(err.stack);
     res.status(401).send("Unauthenticated");
})

app.listen(port,()=>{
     connect();
     console.log(`Server Running on port - ${port}`);
})