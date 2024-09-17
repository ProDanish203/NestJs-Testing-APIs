import { User, Prisma } from '@prisma/client';

type UserWithoutPassword = Omit<User, 'password'>;

// If you need more fine-grained control:
type UserPayload = Prisma.UserGetPayload<{
  select: {
    id: true;
    email: true;
    name: true;
    role: true;
  };
}>;

declare global {
  namespace Express {
    interface Request {
      user?: UserWithoutPassword;
    }
  }
}
