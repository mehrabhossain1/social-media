import { Post as PostType, User } from "@prisma/client";
import Image from "next/image";
import PostInteraction from "./PostInteraction";
import { Suspense } from "react";
import Comments from "./Comments";
import PostInfo from "./PostInfo";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/client";

type FeedPostType = PostType & { user: User } & {
    likes: [{ userId: string }];
} & {
    _count: { comments: number };
};

export default async function Post({ post }: { post: FeedPostType }) {
    const { userId: clerkUserId } = await auth();

    const dbUser = clerkUserId
        ? await prisma.user.findUnique({ where: { clerkId: clerkUserId } })
        : null;

    return (
        <div className="flex flex-col gap-4">
            {/* USER */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Image
                        src={post.user.avatar || "/noAvatar.png"}
                        width={40}
                        height={40}
                        alt=""
                        className="w-10 h-10 rounded-full"
                    />
                    <span className="font-medium">
                        {post.user.name && post.user.surname
                            ? post.user.name + " " + post.user.surname
                            : post.user.username}
                    </span>
                </div>
                {clerkUserId === post.user.clerkId && (
                    <PostInfo postId={post.id} />
                )}
            </div>
            {/* DESC */}
            <div className="flex flex-col gap-4">
                {post.img && (
                    <div className="w-full min-h-96 relative">
                        <Image
                            src={post.img}
                            fill
                            className="object-cover rounded-md"
                            alt=""
                        />
                    </div>
                )}
                <p>{post.desc}</p>
            </div>
            {/* INTERACTION */}
            <Suspense fallback="Loading...">
                <PostInteraction
                    postId={post.id}
                    likes={post.likes.map((l) => l.userId)}
                    currentUserId={dbUser?.id || ""}
                    commentNumber={post._count.comments}
                />
            </Suspense>
            <Suspense fallback="Loading...">
                <Comments postId={post.id} />
            </Suspense>
        </div>
    );
}
