/* eslint-disable @typescript-eslint/no-unused-vars */

"use client";

import { acceptFollowRequest, declineFollowRequest } from "@/lib/actions";
import { FollowRequest, User } from "@prisma/client";
import Image from "next/image";
import { useOptimistic, useState } from "react";

type RequestWithUser = FollowRequest & {
    sender: User;
};

export default function FriendRequestList({
    requests,
}: {
    requests: RequestWithUser[];
}) {
    const [requestState, setRequestState] = useState(requests);

    const accept = async (requestId: string, userId: string) => {
        removeOptimisticRequest(requestId);
        try {
            await acceptFollowRequest(userId);
            setRequestState((prev) =>
                prev.filter((req) => req.id !== String(requestId))
            );
        } catch (err) {}
    };
    const decline = async (requestId: string, userId: string) => {
        removeOptimisticRequest(requestId);
        try {
            await declineFollowRequest(userId);
            setRequestState((prev) =>
                prev.filter((req) => req.id !== String(requestId))
            );
        } catch (err) {}
    };

    const [optimisticRequests, removeOptimisticRequest] = useOptimistic(
        requestState,
        (state, value: string) =>
            state.filter((req) => req.id !== String(value))
    );

    return (
        <div className="">
            {optimisticRequests.map((request) => (
                <div
                    className="flex items-center justify-between"
                    key={request.id}
                >
                    <div className="flex items-center gap-4">
                        <Image
                            src={request.sender.avatar || "/noAvatar.png"}
                            alt=""
                            width={40}
                            height={40}
                            className="w-10 h-10 rounded-full object-cover"
                        />
                        <span className="font-semibold">
                            {request.sender.name && request.sender.surname
                                ? request.sender.name +
                                  " " +
                                  request.sender.surname
                                : request.sender.username}
                        </span>
                    </div>
                    <div className="flex gap-3 justify-end">
                        <form
                            action={() =>
                                accept(
                                    String(request.id),
                                    request.sender.clerkId
                                )
                            }
                        >
                            <button>
                                <Image
                                    src="/accept.png"
                                    alt=""
                                    width={20}
                                    height={20}
                                    className="cursor-pointer"
                                />
                            </button>
                        </form>
                        <form
                            action={() =>
                                decline(
                                    String(request.id),
                                    request.sender.clerkId
                                )
                            }
                        >
                            <button>
                                <Image
                                    src="/reject.png"
                                    alt=""
                                    width={20}
                                    height={20}
                                    className="cursor-pointer"
                                />
                            </button>
                        </form>
                    </div>
                </div>
            ))}
        </div>
    );
}
