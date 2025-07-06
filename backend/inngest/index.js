  import { Inngest } from "inngest";
  import User from "../models/User.js";

  // Create a client to send and receive events
  export const inngest = new Inngest({ id: "moviemate" });

  //function to sync user creation from Clerk to MongoDB
  const syncUserCreation = inngest.createFunction(
    { id: "sync-user-from-clerk" },
    { event: "clerk/user.created" },
    async ({ event }) => {
      const { id, first_name, last_name, email_addresses, image_url } = event.data;
      const userData = {
        _id: id,
        name: `${first_name} ${last_name}`,
        email: email_addresses[0].email_address,
        image: image_url,
      };
      await User.create(userData);
      console.log("User created:", event.data);
      return event.data;
    }
  );

  // fucntion to delete user from MongoDB when user is deleted from Clerk
  const syncUserDeletion = inngest.createFunction(
    { id: "delete-user-with-clerk" },
    { event: "clerk/user.deleted" },
    async ({ event }) => {
      const { id } = event.data;
      await User.findByIdAndDelete(id);
      return event.data;
    }
  );

  // function to update user in MongoDB when user is updated in Clerk
  const syncUserUpdation = inngest.createFunction(
    { id: "update-user-from-clerk" },
    { event: "clerk/user.updated" },
    async ({ event }) => {
      const { id, first_name, last_name, email_addresses, image_url } = event.data;
      const userData = {
        _id: id,
        name: `${first_name} ${last_name}`,
        email: email_addresses[0].email_address,
        image: image_url,
      };
      await User.findByIdAndUpdate(id , userData);
      return event.data;
    }
  );

  export const functions = [syncUserCreation, syncUserDeletion, syncUserUpdation];
