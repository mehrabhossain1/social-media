"use server";

import { auth } from "@clerk/nextjs/server";
import prisma from "./client";
import { z } from "zod";

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

// Accept a follow request
export const acceptFollowRequest = async (clerkSenderId: string) => {
    const { userId: clerkReceiverId } = await auth();
    if (!clerkReceiverId) throw new Error("User is not authenticated!");

    // Get both users from database
    const [receiver, sender] = await Promise.all([
        prisma.user.findUnique({ where: { clerkId: clerkReceiverId } }),
        prisma.user.findUnique({ where: { clerkId: clerkSenderId } }),
    ]);

    if (!receiver || !sender) {
        console.log("Receiver:", receiver);
        console.log("Sender:", sender);
        throw new Error("User(s) not found!");
    }

    try {
        // Check for existing request
        const existingFollowRequest = await prisma.followRequest.findFirst({
            where: {
                senderId: sender.id,
                receiverId: receiver.id,
            },
        });

        if (existingFollowRequest) {
            await prisma.followRequest.delete({
                where: { id: existingFollowRequest.id },
            });

            // Create actual follower relationship
            await prisma.follower.create({
                data: {
                    followerId: sender.id,
                    followingId: receiver.id,
                },
            });
        }
    } catch (err) {
        console.error("[ACCEPT_FOLLOW_REQUEST_ERROR]", err);
        throw new Error("Something went wrong while accepting request!");
    }
};

// Decline a follow request
export const declineFollowRequest = async (clerkSenderId: string) => {
    const { userId: clerkReceiverId } = await auth();
    if (!clerkReceiverId) throw new Error("User is not authenticated!");

    const [receiver, sender] = await Promise.all([
        prisma.user.findUnique({ where: { clerkId: clerkReceiverId } }),
        prisma.user.findUnique({ where: { clerkId: clerkSenderId } }),
    ]);

    if (!receiver || !sender) throw new Error("User(s) not found!");

    try {
        const existingFollowRequest = await prisma.followRequest.findFirst({
            where: {
                senderId: sender.id,
                receiverId: receiver.id,
            },
        });

        if (existingFollowRequest) {
            await prisma.followRequest.delete({
                where: { id: existingFollowRequest.id },
            });
        }
    } catch (err) {
        console.error("[DECLINE_FOLLOW_REQUEST_ERROR]", err);
        throw new Error("Something went wrong while declining request!");
    }
};

export const updateProfile = async (
    prevState: { success: boolean; error: boolean },
    payload: { formData: FormData; cover: string }
) => {
    const { formData, cover } = payload;
    const fields = Object.fromEntries(formData);

    const filteredFields = Object.fromEntries(
        Object.entries(fields).filter(([_, value]) => value !== "")
    );

    const Profile = z.object({
        cover: z.string().optional(),
        name: z.string().max(60).optional(),
        surname: z.string().max(60).optional(),
        description: z.string().max(255).optional(),
        city: z.string().max(60).optional(),
        school: z.string().max(60).optional(),
        work: z.string().max(60).optional(),
        website: z.string().url().max(255).optional().or(z.literal("")), // allow empty string as optional
    });

    const validatedFields = Profile.safeParse({ cover, ...filteredFields });

    if (!validatedFields.success) {
        console.log(validatedFields.error.flatten().fieldErrors);
        return { success: false, error: true };
    }

    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
        return { success: false, error: true };
    }

    try {
        await prisma.user.update({
            where: {
                clerkId: clerkUserId, // ✅ correct field
            },
            data: validatedFields.data,
        });
        return { success: true, error: false };
    } catch (err) {
        console.log(err);
        return { success: false, error: true };
    }
};
