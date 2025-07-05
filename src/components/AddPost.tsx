import { auth } from "@clerk/nextjs/server";

export default async function AddPost() {
    const { userId, redirectToSignIn } = await auth();

    if (!userId) return redirectToSignIn();

    return <h1>Hello, {userId}</h1>;
}
