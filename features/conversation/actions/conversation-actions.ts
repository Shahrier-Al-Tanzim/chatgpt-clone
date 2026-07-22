"use server"
// SERVICE FILE - conversationService
import {prisma} from "@/lib/db"
import { requireUser } from "@/features/auth/action/require-user";
import { revalidatePath } from "next/cache";

/** Shape of a conversation row returned in the sidebar list. */
export type ConversationListItem = {
    id: string;
    title: string;
    isPinned: boolean;
    isArchived: boolean;
    lastMessageAt: Date;
    createdAt: Date;
    updatedAt: Date;
};


export async function assertOwnConversation(conversationId:string, userId:string) {
    const conversation = await prisma.conversation.findFirst({
        where: {
            id: conversationId,
            userId: userId
        }
    })

    if(!conversation) {
        throw new Error ("Conversation not found")
    }

    return conversation
}

export async function getConversation(conversationId : string) {
    const user = await requireUser();
    return assertOwnConversation(conversationId, user.id);
}
export async function listConversations() : Promise <ConversationListItem[]>{
    const user = await requireUser();

    return prisma.conversation.findMany({
        where: {
            userId: user.id,
            isArchived: false,
        },
        select: {
            id: true,
            title: true,
            isPinned: true,
            isArchived: true,
            lastMessageAt: true,
            createdAt: true,
            updatedAt: true,
        },
        orderBy: [
            { isPinned: "desc" },
            { lastMessageAt: "desc" },
        ]
    })
}

export async function createConversation(title = "New Chat"){
    const user = await requireUser();
    return prisma.conversation.create({
        data: {
            userId: user.id,
            title: title.trim() || "New Chat",
        }
    })
}

export async function deleteConversation(conversationId:string) {
    const user = await requireUser();
    await assertOwnConversation(conversationId, user.id)
    await prisma.conversation.delete({
        where: {
            id: conversationId,
            userId: user.id,
        },
    })
    return { id: conversationId };
}

export async function updateConversation(
    conversationId: string,
    data: { title?: string; isPinned?: boolean; isArchived?: boolean }
) {
    const user = await requireUser();
    await assertOwnConversation(conversationId, user.id);

    const conversation = await prisma.conversation.update({
        where: { id: conversationId },
        data: {
            ...(data.title !== undefined ? { title: data.title.trim() || "New Chat" } : {}),
            ...(data.isPinned !== undefined ? { isPinned: data.isPinned } : {}),
            ...(data.isArchived !== undefined ? { isArchived: data.isArchived } : {}),
        },
    });

    revalidatePath("/");
    revalidatePath(`/c/${conversationId}`);
    return conversation;
}
