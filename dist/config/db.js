"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const dbOptions = {
    maxPoolSize: 10,
};
const connectToDb = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('❌ MONGODB_URI is not defined in .env file!');
        }
        await mongoose_1.default.connect(process.env.MONGODB_URI, dbOptions);
        console.log('✅ MongoDB is connected successfully.');
    }
    catch (e) {
        console.error('❌ MongoDB connection failed:', e);
        process.exit(1);
    }
};
exports.default = connectToDb;
