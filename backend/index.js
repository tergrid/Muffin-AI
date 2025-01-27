import express from "express";
import ImageKit from "imagekit";
import cors from 'cors';
import Chat from './models/chat.js';
import UserChats from "./models/userChats.js";
import mongoose from "mongoose";
import { requireAuth } from '@clerk/express';
import Groq from "groq-sdk";

import dotenv from "dotenv";
dotenv.config();

console.log("GROQ_API_KEY:", process.env.GROQ_API_KEY);


const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const retryRequest = async (fn, retries = 3) => {
  let lastError;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      console.log(`Retrying... attempt ${i + 1}`);
      await delay(1000); // Wait for 1 second between retries
    }
  }
  throw lastError;
};

const port = process.env.PORT || 3000;

const app = express();

dotenv.config();

app.use(cors({
  origin: 'http://localhost:5173', // Allow requests from the Vite frontend
  credentials: true, // Allow cookies and authorization headers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allow these HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allow these headers
}));

app.options('*', cors()); // Handle preflight requests

app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  next();
});

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

    console.log("Fetched user chats:", userChats); // Debug log
    if (userChats.length > 0) {
      res.status(200).json(userChats[0].chats); // Return valid JSON
    } else {
      res.status(200).json([]); // Return empty array if no chats found
    }
  } catch (err) {
    console.error("Error fetching user chats:", err);
    res.status(500).json({ error: "Error fetching user chats!" }); // Always return JSON
  }
});

app.get("/api/chats/:id",requireAuth(),async(req, res)=>{
     const userId=req.auth.userId;
     try{
          const chat = await Chat.findOne({_id: req.params.id, userId});
          res.status(200).send(chat);
     }catch(err){
          console.log(err);
          res.status(500).send("Error fetching chat!")
     }
});

app.post("/api/chats", requireAuth(), async (req, res) => {
     const { userId, text } = req.body;
   
     try {
       const newChat = new Chat({
         userId: userId,
         history: [{ role: "user", parts: [{ text }] }],
       });
       const savedChat = await newChat.save();
   
       const userChats = await UserChats.find({ userId: userId });
       if (!userChats.length) {
         const newUserChats = new UserChats({
           userId: userId,
           chats: [
             {
               _id: savedChat.id,
               title: text.substring(0, 40),
             },
           ],
         });
         await newUserChats.save();
       } else {
         await UserChats.updateOne(
           { userId: userId },
           {
             $push: {
               chats: {
                 _id: savedChat._id,
                 title: text.substring(0, 40),
               },
             },
           }
         );
       }
   
       // Groq SDK call
       const groqResponse = await groq.chat.completions.create({
         messages: [
           {
             role: "user",
             content: text,
           },
         ],
         model: "llama-3.3-70b-versatile", // Change model as needed
       });
   
       const completion = groqResponse.choices[0]?.message?.content || "";
       res.status(201).send({ id: savedChat.id, completion });
     } catch (err) {
       console.error(err);
       res.status(500).send("Error creating chat!");
     }
   });

app.put("/api/chats/:id",requireAuth(),async(req, res)=>{
     const userId = req.auth.userId;
     const {question, answer, img} = req.body;
     const newItems = [
          ...(question 
          ? [{role: "user", parts: [{text: question}], ...(img && {img})}]
          : []), 
          {role: "model", parts: [{text: answer}]},
     ];
     try{
          const updatedChat = await Chat.updateOne({_id: req.params.id, userId},{
               $push:{
                    history: {
                         $each: newItems,
                    },
               },
          });
          res.status(200).send(updatedChat);
     }catch(err){
          console.log(err);
          res.status(500).send("Error updating chat!")
     }
})

app.use((err, req, res, next)=>{
     console.error(err.stack);
     res.status(401).send("Unauthenticated");
})

app.listen(port,()=>{
     connect();
     console.log(`Server Running on port - ${port}`);
});
