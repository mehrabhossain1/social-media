/* eslint-disable @typescript-eslint/no-unused-vars */

import prisma from "@/lib/client";
import CommentList from "./CommentList";

export default async function Comments({ postId }: { postId: string }) {
    const comments = await prisma.comment.findMany({
        where: {
            postId,
        },
        include: {
            user: true,
        },
    });
    console.log("Comments:", comments);

    return (
        <div>
            {/* WRITE */}
            <CommentList comments={comments} postId={postId} />
        </div>
    );
}
