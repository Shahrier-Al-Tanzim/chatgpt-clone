"use server"

import { currentUser } from "@clerk/nextjs/server"
import {prisma} from "@/lib/db"
import type {User} from "@/lib/generated/prisma/client"

export async function onBoard() {
    const clerkUser = await currentUser();

    if(!clerkUser) {
        throw new Error("Unauthorized")
    }

    const email = clerkUser.emailAddresses[0]?.emailAddress ?? null;

    return prisma.user.upsert({
        where :{clerkid: clerkUser.id},
        create:{
            clerkid: clerkUser.id,
            email: email,
            firstName: clerkUser.firstName,
            lastName: clerkUser.lastName,
            imageUrl: clerkUser.imageUrl
        },
        update: {
            email : email,
            firstName: clerkUser.firstName,
            lastName: clerkUser.lastName,
            imageUrl: clerkUser.imageUrl
        }
    })
}