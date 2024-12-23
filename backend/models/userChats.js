import mongoose from "mongoose";

const userChatsSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    chats: [
      {
        _id: {
          type: String,
          required: true,
        },
        title: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now, // Fixed default syntax
        },
      },
    ],
  },
  { timestamps: true } // Adds createdAt and updatedAt fields for the schema
);

export default mongoose.models.UserChat || mongoose.model("UserChat", userChatsSchema);
