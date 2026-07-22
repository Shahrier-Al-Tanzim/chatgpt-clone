import { getConversation } from '@/features/conversation/actions/conversation-actions';
import { notFound } from 'next/navigation';
import React from 'react'

type ConversationPageProps = {
    params: Promise <{id: string}>;
}

const Page = async ({params}: ConversationPageProps) => {
    const {id} = await params;

    try {
        const conversation = await getConversation(id);
    }catch (error) {
        notFound();
    }

    // const initialMessages = await loadChatMessages(id);
  return (
    <div>Page {id}</div>
  )
}

export default Page