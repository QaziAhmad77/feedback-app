import 'next-auth';

declare module 'next-auth' {
// Session Interface Extension:
// The Session interface is extended to include a custom user object that contains additional fields such as _id, isVerified, isAcceptingMessages, and username.
// The & DefaultSession['user'] part ensures that the default properties provided by the original next-auth Session type are still included (e.g., email, name, etc.). This creates a union of the default fields and the custom fields, allowing both to coexist.
  interface Session {
    user: {
      _id?: string;
      isVerified?: boolean;
      isAcceptingMessages?: boolean;
      username?: string;
    } & DefaultSession['user'];
  }

  interface User {
    _id?: string;
    isVerified?: boolean;
    isAcceptingMessages?: boolean;
    username?: string;
  }
}

// we can do like this also instead of above one
declare module 'next-auth/jwt' {
  interface JWT {
    _id?: string;
    isVerified?: boolean;
    isAcceptingMessages?: boolean;
    username?: string;
  }
}
