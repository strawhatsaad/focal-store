// File: app/api/auth/[...nextauth]/route.ts

import NextAuth from "next-auth";
import { authOptions } from "@/lib/authOptions"; // Adjust path if your lib folder is elsewhere (e.g., ../../../lib/authOptions)

// The NextAuth function returns a handler that can be exported directly.
const handler = NextAuth(authOptions);

// Export the handler for GET and POST requests as required by Next.js App Router.
export { handler as GET, handler as POST };
