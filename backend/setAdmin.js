import { clerkClient } from "@clerk/express";
import dotenv from "dotenv";
dotenv.config();

console.log("🔑 Using Clerk Secret:", process.env.CLERK_SECRET_KEY);

const userIdToPromote = "user_2zZ2USM8hXeVScMKtJMyZvUBb4o";

async function setAdminRole() {
  try {
    const userListResponse = await clerkClient.users.getUserList({ limit: 100 });
    const users = userListResponse.data;

    console.log("📋 Users found:");
    users.forEach((u) => {
      console.log(`${u.id} => ${u.emailAddresses[0]?.emailAddress}`);
    });

    const user = await clerkClient.users.getUser(userIdToPromote);

    console.log("👤 metadata:", user.privateMetadata.role);
    console.log("👤 Found user:", user.emailAddresses[0]?.emailAddress);

    await clerkClient.users.updateUserMetadata(userIdToPromote, {
      privateMetadata: {
        role: "admin",
      },
    });

    console.log(`✅ Admin role set for user: ${user.emailAddresses[0]?.emailAddress}`);
  } catch (error) {
    console.error("❌ Failed to set admin role:", error);
  }
}

setAdminRole();
