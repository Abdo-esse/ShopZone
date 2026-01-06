// apps/auth-service/src/auth-service.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'libs/shared/src/prisma/prisma.service';
import { RegisterDto } from '../../../libs/shared/src/dto/register.dto';
import * as bcrypt from 'bcrypt';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import { LoginDto } from '../../../libs/shared/src/dto/login.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthServiceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) { }


  async register(dto: RegisterDto) {
    console.log(`[AuthService] New user registered: ${dto.email}`)
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    })

    if (existingUser) {
      throw new ConflictException('User already exists')
    }

    const passwordHash = await bcrypt.hash(dto.password, 12)

    return this.prisma.user.create({
      data: {
        email: dto.email,
        password: passwordHash,
      },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
      },
    })
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateTokens(user.id, user.email, user.role);
  }

  private async generateTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };
    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '1h',
    });
    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: '7d',
    });

    // Store refresh token in DB
    await this.prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: userId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: userId,
        email: email,
        role: role,
      },
    };
  }

  async refresh(refreshTokenStr: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshTokenStr);
      const storedToken = await this.prisma.refreshToken.findUnique({
        where: { token: refreshTokenStr },
      });

      if (!storedToken || storedToken.expiresAt < new Date()) {
        throw new UnauthorizedException('Invalid or expired refresh token');
      }

      // Revoke old token
      await this.prisma.refreshToken.delete({
        where: { token: refreshTokenStr },
      });

      // Generate new pair
      return this.generateTokens(payload.sub, payload.email, payload.role);
    } catch (e) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string, refreshTokenStr: string) {
    await this.prisma.refreshToken.deleteMany({
      where: {
        userId,
        token: refreshTokenStr,
      },
    });
    return { success: true };
  }
}
