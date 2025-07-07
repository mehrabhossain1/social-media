import Link from "next/link";
import FriendRequestList from "./FriendRequestList";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/client";

export default async function FriendRequests() {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) return null;

    // ✅ Get the current user from your DB
    const currentUser = await prisma.user.findUnique({
        where: { clerkId: clerkUserId },
    });

    if (!currentUser) return null;

    // ✅ Use the DB _id (ObjectId)
    const requests = await prisma.followRequest.findMany({
        where: {
            receiverId: currentUser.id,
        },
        include: {
            sender: true,
        },
    });

    if (requests.length === 0) return null;

    return (
        <div className="p-4 bg-white rounded-lg shadow-md text-sm flex flex-col gap-4">
            {/* TOP */}
            <div className="flex justify-between items-center font-medium">
                <span className="text-gray-500">Friend Requests</span>
                <Link href="/" className="text-blue-500 text-xs">
                    See all
                </Link>
            </div>

            {/* USER LIST */}
            <FriendRequestList requests={requests} />
        </div>
    );
}
