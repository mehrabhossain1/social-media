import prisma from "@/lib/client";
import StoryList from "./StoryList";
import { auth } from "@clerk/nextjs/server";

export default async function Stories() {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) return null;

    // Get MongoDB userId from Clerk user
    const currentUser = await prisma.user.findUnique({
        where: { clerkId: clerkUserId },
    });

    if (!currentUser) return null;

    const currentUserId = currentUser.id;

    const stories = await prisma.story.findMany({
        where: {
            expiresAt: {
                gt: new Date(),
            },
            OR: [
                {
                    user: {
                        followers: {
                            some: {
                                followerId: currentUserId,
                            },
                        },
                    },
                },
                {
                    userId: currentUserId,
                },
            ],
        },
        include: {
            user: true,
        },
    });

    return (
        <div className="p-4 bg-white rounded-lg shadow-md overflow-scroll text-xs scrollbar-hide">
            <div className="flex gap-8 w-max">
                <StoryList stories={stories} userId={currentUserId} />
            </div>
        </div>
    );
}
