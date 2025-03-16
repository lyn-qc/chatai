import mongoose from "mongoose";

let cachedConnection: typeof mongoose | null = null;

async function connectDB() {
    if (cachedConnection) {
        return cachedConnection;
    }
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URL || 'mongodb://127.0.0.1:27017/999');
        console.log('ok');

        cachedConnection = conn;
        return conn;
    } catch (error) {
        console.log(error);
        throw error;
    }
}
connectDB();
const deepseekSchema = new mongoose.Schema({
    messages: [
        {
            role: String, // 'user' 或 'assistant'
            content: String,
            createdAt: { type: Date, default: Date.now }
        }
    ],
    sessionId: String,     // 可选：会话ID
    ipAddress: String,     // 请求IP
    userAgent: String,     // 用户浏览器信息
    createdAt: { type: Date, default: Date.now },

})

let deepseekmodel;
try {
    deepseekmodel = mongoose.models.deepseek || mongoose.model('deepseek', deepseekSchema);
} catch (error) {
    console.error('Error registering deepseek model:', error);
    throw error;
}

export {

    deepseekmodel
}
