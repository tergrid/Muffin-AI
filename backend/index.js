import express from "express";
import ImageKit from "imagekit";
import Chat from "./models/chat.js";
import UserChats from "./models/userChats.js";
import mongoose from "mongoose";
import { requireAuth } from "@clerk/express";
import Groq from "groq-sdk";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();
const port = process.env.PORT || 3000;
const app = express();
app.use(express.json());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});

app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.options("*", cors());

console.log("GROQ_API_KEY:", process.env.GROQ_API_KEY);

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const connect = async () => {
  try {
    await mongoose.connect(process.env.MONGO);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("MongoDB connection error:", err);
  }
};

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

app.get("/", (req, res) => {
  res.send("root path");
});

app.get("/api/upload", (req, res) => {
  const result = imagekit.getAuthenticationParameters();
  res.send(result);
});

// ✅ FIXED: Ensure `userId` is always retrieved from Clerk
app.get("/api/userchats", requireAuth(), async (req, res) => {
  const userId = req.auth?.userId;

  if (!userId) {
    console.warn("⚠️ Unauthorized access attempt - Missing userId");
    return res
      .status(401)
      .json({ error: "Unauthorized: No valid session token." });
  }

  try {
    const userChats = await UserChats.find({ userId });
    console.log(`✅ Fetched user chats for userId: ${userId}`, userChats);
    res.status(200).json(userChats.length > 0 ? userChats[0].chats : []);
  } catch (err) {
    console.error("❌ Error fetching user chats:", err);
    res.status(500).json({ error: "Error fetching user chats!" });
  }
});

app.get("/api/chats/:id", requireAuth(), async (req, res) => {
  const userId = req.auth?.userId;

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    console.log("Fetching chat with ID:", req.params.id); // ✅ Debugging Log

    const chat = await Chat.findOne({ _id: req.params.id, userId });

    if (!chat) {
      console.log(`❌ Chat not found for ID: ${req.params.id}`);
      return res.status(404).json({ error: "Chat not found" });
    }

    console.log("✅ Found chat:", chat);
    res.status(200).json(chat);
  } catch (err) {
    console.error("❌ Error fetching chat:", err);
    res.status(500).json({ error: "Error fetching chat!" });
  }
});
// ✅ FIXED: Prevent `userId` missing error when creating a chat
app.post("/api/chats", requireAuth(), async (req, res) => {
  const userId = req.auth?.userId; // ✅ Extract userId from Clerk authentication
  const { text } = req.body;

  if (!userId) {
    console.warn("⚠️ Unauthorized attempt to create a chat - Missing userId");
    return res.status(401).json({ error: "Unauthorized: userId is missing" });
  }

  if (!text) {
    return res.status(400).json({ error: "Chat text is required" });
  }

  try {
    const newChat = new Chat({
      userId: userId,
      history: [{ role: "user", parts: [{ text }] }],
    });
    const savedChat = await newChat.save();

    const userChats = await UserChats.findOne({ userId });
    if (!userChats) {
      const newUserChats = new UserChats({
        userId: userId,
        chats: [{ _id: savedChat.id, title: text.substring(0, 40) }],
      });
      await newUserChats.save();
    } else {
      await UserChats.updateOne(
        { userId: userId },
        {
          $push: {
            chats: { _id: savedChat._id, title: text.substring(0, 40) },
          },
        }
      );
    }

    // ✅ Groq SDK call (Ensure error handling)
    let completion = "";
    try {
      const groqResponse = await groq.chat.completions.create({
        messages: [{ role: "user", content: text }],
        model: "llama-3.3-70b-versatile",
      });
      completion = groqResponse.choices[0]?.message?.content || "";
    } catch (groqErr) {
      console.error("❌ Groq API Error:", groqErr);
    }

    res.status(201).json({ id: savedChat.id, completion });
  } catch (err) {
    console.error("❌ Error creating chat:", err);
    res.status(500).json({ error: "Error creating chat!" });
  }
});

app.put("/api/chats/:id", requireAuth(), async (req, res) => {
  const userId = req.auth?.userId;
  const { question, answer, img } = req.body;

  if (!userId) {
    console.warn("⚠️ Unauthorized attempt to update chat - Missing userId");
    return res.status(401).json({ error: "Unauthorized: userId is missing" });
  }

  const newItems = [
    ...(question
      ? [{ role: "user", parts: [{ text: question }], ...(img && { img }) }]
      : []),
    { role: "model", parts: [{ text: answer }] },
  ];

  try {
    const updatedChat = await Chat.updateOne(
      { _id: req.params.id, userId },
      { $push: { history: { $each: newItems } } }
    );
    res.status(200).json(updatedChat);
  } catch (err) {
    console.error("❌ Error updating chat:", err);
    res.status(500).json({ error: "Error updating chat!" });
  }
});

// ✅ Authentication error handling
app.use((err, req, res, next) => {
  console.error("❌ Unauthenticated request:", err.stack);
  res.status(401).json({ error: "Unauthenticated" });
});

app.listen(port, () => {
  connect();
  console.log(`🚀 Server Running on port ${port}`);
});
