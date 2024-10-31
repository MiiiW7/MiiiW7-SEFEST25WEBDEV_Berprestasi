import dotenv from 'dotenv'
dotenv.config()

export const PORT = process.env.PORT
export const mongoDBURL = process.env.MONGODB_URL;
export const JWT_SECRET = process.env.JWT_SECRET;

