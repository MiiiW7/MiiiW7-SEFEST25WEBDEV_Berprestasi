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
    categories: [
      {
        type: String,
        enum: [
          "Akademik",
          "Non-Akademik",
          "Seni",
          "Olahraga",
          "Teknologi",
          "Bahasa",
          "Sains",
          "Matematika",
        ],
        required: true,
      },
    ],
    jenjangs: [
      {
        type: String,
        enum: ["SD", "SMP", "SMA", "SMK", "Mahasiswa", "Umum"],
        required: true,
      },
    ],
    creator: {
      type: String,
      required: true,
      ref: "User",
    },
    followers: [
      {
        type: String,
        ref: "User",
      },
    ],
    pelaksanaan: {
      type: Date,
      required: true,
    },
    link: {
      type: String,
      required: false,
      validate: {
        validator: function (v) {
          // Regex yang lebih komprehensif
          const urlPattern = new RegExp(
            "^(https?:\\/\\/)?" + // protokol
              "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
              "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
              "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
              "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
              "(\\#[-a-z\\d_]*)?$",
            "i" // fragment locator
          );
          return !v || urlPattern.test(v);
        },
        message: (props) => `${props.value} bukan URL yang valid!`,
      },
    },
    status: {
      type: String,
      enum: ["Belum Dilaksanakan", "Sedang Dilaksanakan", "Telah Dilaksanakan"],
      default: "Belum Dilaksanakan",
      required: true,
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
