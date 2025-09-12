import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { User } from '@ria/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { prisma } from '@ria/db';

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'fallback-secret-key';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Find user in database
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });
          
          if (!user) {
            return null;
          }

          // Verify password
          const isValidPassword = await bcrypt.compare(credentials.password, user.password);
          
          if (!isValidPassword) {
            return null;
          }

          // Return user object that will be encoded in the JWT
          return {
            id: user.id,
            email: user.email,
            name: user.displayName,
            // For now, using a default tenant ID
            tenantId: 'default-tenant',
            // For now, assigning default user role
            roles: ['user'],
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      }
    })
  ],
  pages: {
    signIn: '/auth/sign-in',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    secret: JWT_SECRET,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      // When user signs in, add user data to token
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.tenantId = (user as any).tenantId;
        token.roles = (user as any).roles;
      }
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client
      if (token) {
        session.user = {
          id: token.id as string,
          email: token.email as string,
          name: token.name as string,
          tenantId: token.tenantId as string,
          roles: token.roles as string[],
        } as User;
      }
      return session;
    },
  },
  debug: process.env.NODE_ENV === 'development',
};

// Utility functions for server-side auth operations
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export async function createJWT(payload: any): Promise<string> {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });
}

export async function verifyJWT(token: string): Promise<any> {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid token');
  }
}

// User registration function using Prisma
export async function registerUser(email: string, password: string, name: string) {
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });
  
  if (existingUser) {
    throw new Error('User already exists');
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Create new user in database
  const newUser = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      displayName: name,
    },
  });

  return {
    id: newUser.id,
    email: newUser.email,
    name: newUser.displayName,
    // For now, using default values
    tenantId: 'default-tenant',
    roles: ['user'],
  };
}