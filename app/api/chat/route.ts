import { loadChatMessages, saveChatMessages } from "@/features/ai/actions/chat-store";
import { getChatModel } from "@/features/ai/utils/model";
import { requireUser } from "@/features/auth/action/require-user";
import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import {convertToModelMessages, createIdGenerator, createUIMessageStream, createUIMessageStreamResponse, streamText, toUIMessageStream, type UIMessage} from "ai"

export async function POST(req: Request) {
    await auth.protect();

    const {message, id} : {message: UIMessage, id: string} = await req.json();

    if(!message || !id) {
        return new Response('Missing data', {status: 400})
    }
    
    const user = await requireUser();

    const conversation = await prisma.conversation.findFirst({
        where:{
            id,
            userId: user.id,
        }
    })

    if(!conversation) {
        return new Response('Conversation not found', {status: 404})
    }

    // we do not add the messages array in the ui message type
    const previousMesages = await loadChatMessages(id);
    const alreadySaved = previousMesages.some(
        (storedMessage) => storedMessage.id === message.id
    );

    const messages = alreadySaved? previousMesages : [...previousMesages, message]
    if(!alreadySaved) {
        await saveChatMessages(id, [message])
    }


    const result = streamText({
        model: getChatModel(conversation.model),
        system: conversation.model ?? "You are a helpful assistant",
        messages: await convertToModelMessages(messages),
        
    })

    result.consumeStream()

    return createUIMessageStreamResponse({
        stream: toUIMessageStream({
            stream:result.stream,
            originalMessages: messages,
            generateMessageId: createIdGenerator({prefix: "msg", size: 16}),
            onEnd: async({messages:finalMessages})=>{
                try{
                    await saveChatMessages(id, finalMessages, {updateTitle:false})
                }catch (error){
                    console.error("Failed to save chat messages", error)
                }
            }
        })
    })
}