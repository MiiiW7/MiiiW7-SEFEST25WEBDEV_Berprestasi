// models/post.js
import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      unique: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    categories: [{
      type: String,
      enum: [
        "Akademik",
        "Non-Akademik",
        "Seni",
        "Olahraga",
        "Teknologi",
        "Bahasa",
        "Sains",
        "Matematika"
      ],
      required: true,
    }],
    creator: {
      type: String,
      required: true,
      ref: "User",
    },
    status: {
      type: String,
      enum: ["published", "draft"],
      default: "published",
    },
  },
  {
    timestamps: true,
  }
);

// Fungsi untuk generate ID yang lebih sederhana
function generateCustomId() {
  const timestamp = new Date().getTime();
  // Ambil 4 digit terakhir dari timestamp
  const lastFourDigits = timestamp.toString().slice(-4);
  // Generate 2 karakter random
  const randomChars = Math.random().toString(36).substring(2, 4).toUpperCase();
  return `P${lastFourDigits}${randomChars}`;
}

postSchema.pre("save", async function (next) {
  if (!this.id) {
    this.id = generateCustomId();
  }
  next();
});
const Post = mongoose.model("Post", postSchema);

export default Post;
