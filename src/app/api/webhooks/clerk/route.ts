import prisma from "@/lib/client";
import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const evt = await verifyWebhook(req);

        // Do something with payload
        // For this guide, log payload to console
        const { id } = evt.data;
        const eventType = evt.type;
        console.log(
            `Received webhook with ID ${id} and event type of ${eventType}`
        );
        console.log("Webhook payload:", evt.data);

        // You can handle different event types here
        if (eventType === "user.created") {
            // Handle user created event
            console.log("User created:", evt.data);
            try {
                await prisma.user.create({
                    data: {
                        clerkId: evt.data.id,
                        username: evt.data.username || "",
                        avatar: evt.data.image_url || "/noAvatar.png",
                        cover: "/noCover.png",
                    },
                });
                return new Response("User created successfully", {
                    status: 200,
                });
            } catch (err) {
                console.log(err);
                return new Response("Failed to create user!", { status: 500 });
            }
        }
        if (eventType === "user.updated") {
            // Handle user created event
            console.log("User updated:", evt.data);
            try {
                await prisma.user.update({
                    where: { clerkId: evt.data.id },
                    // Update only the fields that are present in the event data
                    data: {
                        username: evt.data.username || "",
                        avatar: evt.data.image_url || "/noAvatar.png",
                    },
                });
                return new Response("User updated successfully", {
                    status: 200,
                });
            } catch (err) {
                console.log(err);
                return new Response("Failed to update user!", { status: 500 });
            }
        }

        return new Response("Webhook received", { status: 200 });
    } catch (err) {
        console.error("Error verifying webhook:", err);
        return new Response("Error verifying webhook", { status: 400 });
    }
}
