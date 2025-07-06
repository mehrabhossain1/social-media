import prisma from "@/lib/client";
import { auth } from "@clerk/nextjs/server";
import { User } from "@prisma/client";
import UpdateUser from "./UpdateUser";
import Link from "next/link";
import Image from "next/image";
import UserInfoCardInteraction from "./UserInfoCardInteraction";

export default async function UserInfoCard({ user }: { user: User }) {
    const createdAtDate = new Date(user.createdAt);

    const formattedDate = createdAtDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    let isUserBlocked = false;
    let isFollowing = false;
    let isFollowingSent = false;
    let currentUserId: string | null = null;

    const { userId: clerkUserId } = await auth();

    if (clerkUserId) {
        // 🔍 First: find current user in your own database
        const currentUser = await prisma.user.findUnique({
            where: { clerkId: clerkUserId },
        });

        if (currentUser) {
            currentUserId = currentUser.id;

            // ✅ Block check
            const blockRes = await prisma.block.findFirst({
                where: {
                    blockerId: currentUserId,
                    blockedId: user.id,
                },
            });
            isUserBlocked = !!blockRes;

            // ✅ Follow check
            const followRes = await prisma.follower.findFirst({
                where: {
                    followerId: currentUserId,
                    followingId: user.id,
                },
            });
            isFollowing = !!followRes;

            // ✅ Follow request check
            const followReqRes = await prisma.followRequest.findFirst({
                where: {
                    senderId: currentUserId,
                    receiverId: user.id,
                },
            });
            isFollowingSent = !!followReqRes;
        }
    }

    return (
        <div className="p-4 bg-white rounded-lg shadow-md text-sm flex flex-col gap-4">
            {/* TOP */}
            <div className="flex justify-between items-center font-medium">
                <span className="text-gray-500">User Information</span>
                {currentUserId === user.id ? (
                    <UpdateUser user={user} />
                ) : (
                    <Link href="/" className="text-blue-500 text-xs">
                        See all
                    </Link>
                )}
            </div>
            {/* BOTTOM */}
            <div className="flex flex-col gap-4 text-gray-500">
                <div className="flex items-center gap-2">
                    <span className="text-xl text-black">
                        {" "}
                        {user.name && user.surname
                            ? user.name + " " + user.surname
                            : user.username}
                    </span>
                    <span className="text-sm">@{user.username}</span>
                </div>
                {user.description && <p>{user.description}</p>}
                {user.city && (
                    <div className="flex items-center gap-2">
                        <Image src="/map.png" alt="" width={16} height={16} />
                        <span>
                            Living in <b>{user.city}</b>
                        </span>
                    </div>
                )}
                {user.school && (
                    <div className="flex items-center gap-2">
                        <Image
                            src="/school.png"
                            alt=""
                            width={16}
                            height={16}
                        />
                        <span>
                            Went to <b>{user.school}</b>
                        </span>
                    </div>
                )}
                {user.work && (
                    <div className="flex items-center gap-2">
                        <Image src="/work.png" alt="" width={16} height={16} />
                        <span>
                            Works at <b>{user.work}</b>
                        </span>
                    </div>
                )}
                <div className="flex items-center justify-between">
                    {user.website && (
                        <div className="flex gap-1 items-center">
                            <Image
                                src="/link.png"
                                alt=""
                                width={16}
                                height={16}
                            />
                            <Link
                                href={user.website}
                                className="text-blue-500 font-medium"
                            >
                                {user.website}
                            </Link>
                        </div>
                    )}
                    <div className="flex gap-1 items-center">
                        <Image src="/date.png" alt="" width={16} height={16} />
                        <span>Joined {formattedDate}</span>
                    </div>
                </div>
                {currentUserId && currentUserId !== user.id && (
                    <UserInfoCardInteraction
                        userId={user.id}
                        isUserBlocked={isUserBlocked}
                        isFollowing={isFollowing}
                        isFollowingSent={isFollowingSent}
                    />
                )}
            </div>
        </div>
    );
}
