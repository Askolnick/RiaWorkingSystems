import 'next-auth';
import { User } from '@ria/client';

declare module 'next-auth' {
  interface Session {
    user: User;
  }

  interface User {
    id: string;
    email: string;
    name: string;
    tenantId: string;
    roles: string[];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    email: string;
    name: string;
    tenantId: string;
    roles: string[];
  }
}