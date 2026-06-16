import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { CookieOptions } from 'express';

@Injectable()
export class AuthCookieConfig {
  constructor(private readonly configService: ConfigService) {}

  getAuthCookieOptions(): CookieOptions {
    return {
      httpOnly: true,
      secure: this.getCookieSecure(),
      sameSite: this.getCookieSameSite(),
      maxAge: this.getCookieMaxAge(),
      path: '/',
    };
  }

  getClearAuthCookieOptions(): CookieOptions {
    const { maxAge: _maxAge, ...options } = this.getAuthCookieOptions();
    return options;
  }

  private getCookieSecure(): boolean {
    return this.configService.get<string>('COOKIE_SECURE') === 'true';
  }

  private getCookieSameSite(): CookieOptions['sameSite'] {
    const value = this.configService
      .get<string>('COOKIE_SAME_SITE', 'lax')
      .toLowerCase();

    if (value === 'strict' || value === 'none') {
      return value;
    }

    return 'lax';
  }

  private getCookieMaxAge(): number {
    const value = Number(
      this.configService.get<string>('JWT_COOKIE_MAX_AGE_MS'),
    );

    return value;
  }
}
