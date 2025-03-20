import { createDeepSeek } from '@ai-sdk/deepseek';
import { streamText } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 60;
const deepseek = createDeepSeek({
    apiKey: "sk-9ccae550b8bf4285b1c54054b133b8b2",
    baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
});
export async function POST(req: Request) {

    const { messages } = await req.json();

    const result = streamText({
        model: deepseek('deepseek-r1'),
        system: '你是一个专业的AI助手，请根据用户的问题给出详细的回答。',
        messages,
    });

    return result.toDataStreamResponse(
        { sendReasoning: true, }
    );
}