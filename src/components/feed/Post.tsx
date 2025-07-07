import { Post as PostType, User } from "@prisma/client";
import Image from "next/image";

type FeedPostType = PostType & { user: User } & {
    likes: [{ userId: string }];
} & {
    _count: { comments: number };
};

export default function Post({ post }: { post: FeedPostType }) {
    return (
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
        </div>
    );
}
