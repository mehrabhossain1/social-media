// @typescript-eslint/no-explicit-any

import prisma from "@/lib/client";
import { auth } from "@clerk/nextjs/server";
import Post from "./Post";

export default async function Feed({ username }: { username?: string }) {
    const { userId: clerkUserId } = await auth(); // ✅ Await auth()

    let posts: any[] = [];

    if (username) {
        posts = await prisma.post.findMany({
            where: {
                user: {
                    username,
                },
            },
            include: {
                user: true,
                likes: {
                    select: {
                        userId: true,
                    },
                },
                _count: {
                    select: {
                        comments: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });
    } else if (clerkUserId) {
        const currentUser = await prisma.user.findUnique({
            where: { clerkId: clerkUserId },
            select: { id: true },
        });

        if (!currentUser) return [];

        const following = await prisma.follower.findMany({
            where: {
                followerId: currentUser.id,
            },
            select: {
                followingId: true,
            },
        });

        const followingIds = following.map((f) => f.followingId);
        const ids = [currentUser.id, ...followingIds];

        posts = await prisma.post.findMany({
            where: {
                userId: {
                    in: ids,
                },
            },
            include: {
                user: true,
                likes: {
                    select: {
                        userId: true,
                    },
                },
                _count: {
                    select: {
                        comments: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });
    }

    return (
        <div className="p-4 bg-white shadow-md rounded-lg flex flex-col gap-12">
            {posts.length
                ? posts.map((post) => <Post key={post.id} post={post} />)
                : "No posts found!"}
        </div>
    );
}
