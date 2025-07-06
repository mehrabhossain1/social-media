"use server";

import { auth } from "@clerk/nextjs/server";
import prisma from "./client";

export const switchFollow = async (targetUserId: string) => {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
        throw new Error("User is not authenticated!");
    }

    try {
        // 🔍 Find the current logged-in user from your DB using Clerk ID
        const currentUser = await prisma.user.findUnique({
            where: { clerkId: clerkUserId },
        });

        if (!currentUser) {
            throw new Error("Current user not found in database!");
        }

        const currentUserId = currentUser.id; // ✅ MongoDB ObjectId

        // 🔍 Check if following already exists
        const existingFollow = await prisma.follower.findFirst({
            where: {
                followerId: currentUserId,
                followingId: targetUserId,
            },
        });

        if (existingFollow) {
            // ✅ Already following → unfollow
            await prisma.follower.delete({
                where: { id: existingFollow.id },
            });
        } else {
            // 🔍 Check if a follow request already exists
            const existingFollowRequest = await prisma.followRequest.findFirst({
                where: {
                    senderId: currentUserId,
                    receiverId: targetUserId,
                },
            });

            if (existingFollowRequest) {
                // ✅ Follow request exists → cancel request
                await prisma.followRequest.delete({
                    where: { id: existingFollowRequest.id },
                });
            } else {
                // ✅ No follow or request → send follow request
                await prisma.followRequest.create({
                    data: {
                        senderId: currentUserId,
                        receiverId: targetUserId,
                    },
                });
            }
        }
    } catch (err) {
        console.error("[SWITCH_FOLLOW_ERROR]", err);
        throw new Error("Something went wrong!");
    }
};

export const switchBlock = async (userId: string) => {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
        throw new Error("User is not authenticated!");
    }

    try {
        // 🔍 Find the current logged-in user from your DB using Clerk ID
        const currentUser = await prisma.user.findUnique({
            where: { clerkId: clerkUserId },
        });

        if (!currentUser) {
            throw new Error("Current user not found in database!");
        }

        const currentUserId = currentUser.id; // ✅ MongoDB ObjectId

        const existingBlock = await prisma.block.findFirst({
            where: {
                blockerId: currentUserId,
                blockedId: userId,
            },
        });

        if (existingBlock) {
            await prisma.block.delete({
                where: {
                    id: existingBlock.id,
                },
            });
        } else {
            await prisma.block.create({
                data: {
                    blockerId: currentUserId,
                    blockedId: userId,
                },
            });
        }
        console.log("[SWITCH_BLOCK_SUCCESS]", {
            blockerId: currentUserId,
            blockedId: userId,
        });
    } catch (err) {
        console.log(err);
        throw new Error("Something went wrong!");
    }
};
