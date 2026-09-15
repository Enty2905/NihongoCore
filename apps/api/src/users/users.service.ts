import { Injectable } from '@nestjs/common';
import type { User } from '../generated/prisma/client';
import { PrismaService } from '../database/prisma.service';

export interface SafeUser {
  id: string;
  email: string;
  displayName: string | null;
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  toSafeUser(user: Pick<User, 'id' | 'email' | 'displayName'>): SafeUser {
    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
    };
  }
}
