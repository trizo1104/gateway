import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import type { Response } from 'express';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto, UserStatusDto } from './dto/update-user.dto';
import { ListUsersQueryDto } from './dto/list-users-query.dto';
import { Public } from '@common/decorators/public.decorator';
import { RequirePermissions } from '@common/decorators/require-permissions.decorator';
import type { AuthenticatedRequest } from '@common/interfaces/authenticated-request.interface';
import { extractAuthToken } from '@common/auth/auth-token.util';
import { AuthCookieConfig } from './utils/auth-cookie.options';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly authCookieConfig: AuthCookieConfig,
  ) {}

  @Public()
  @Post('login')
  @HttpCode(200)
  async login(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authService.login({
      email: body.email,
      password: body.password,
    });

    response.cookie(
      'token',
      result.accessToken,
      this.authCookieConfig.getAuthCookieOptions(),
    );

    return {
      message: result.message,
    };
  }

  @Public()
  @Post('logout')
  @HttpCode(200)
  logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie(
      'token',
      this.authCookieConfig.getClearAuthCookieOptions(),
    );

    return {
      message: 'Logout success',
    };
  }

  @Get('me')
  me(@Req() request: AuthenticatedRequest) {
    return this.authService.me(extractAuthToken(request));
  }

  @Post('users')
  @RequirePermissions('USER_CREATE')
  createUser(
    @Req() request: AuthenticatedRequest,
    @Body() body: CreateUserDto,
  ) {
    return this.authService.createUser(
      {
        username: body.username,
        email: body.email,
        password: body.password,
        phone: body.phone ?? '',
      },
      extractAuthToken(request),
    );
  }

  @Get('users')
  @RequirePermissions('USER_READ')
  listUsers(
    @Req() request: AuthenticatedRequest,
    @Query() query: ListUsersQueryDto,
  ) {
    return this.authService.listUsers(
      {
        page: query.page,
        size: query.size,
        keyword: query.keyword ?? '',
      },
      extractAuthToken(request),
    );
  }

  @Get('users/:id')
  @RequirePermissions('USER_READ')
  getUserById(@Req() request: AuthenticatedRequest, @Param('id') id: string) {
    return this.authService.getUserById({ id }, extractAuthToken(request));
  }

  USER_STATUS_MAP: Record<UserStatusDto, number> = {
    [UserStatusDto.ACTIVE]: 1,
    [UserStatusDto.INACTIVE]: 2,
    [UserStatusDto.LOCKED]: 3,
  };

  @Patch('users/:id')
  @RequirePermissions('USER_UPDATE')
  updateUser(
    @Req() request: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() body: UpdateUserDto,
  ) {
    return this.authService.updateUser(
      {
        id,
        email: body.email ?? '',
        phone: body.phone ?? '',
        status: body.status ? this.USER_STATUS_MAP[body.status] : 0,
      },
      extractAuthToken(request),
    );
  }

  @Delete('users/:id')
  @RequirePermissions('USER_DELETE')
  deleteUser(@Req() request: AuthenticatedRequest, @Param('id') id: string) {
    return this.authService.deleteUser({ id }, extractAuthToken(request));
  }

  @Get('roles')
  @RequirePermissions('ROLE_READ')
  listRoles(@Req() request: AuthenticatedRequest) {
    return this.authService.listRoles(extractAuthToken(request));
  }

  @Post('users/:userId/roles/:roleId')
  @RequirePermissions('ROLE_ASSIGN')
  assignRoleToUser(
    @Req() request: AuthenticatedRequest,
    @Param('userId') userId: string,
    @Param('roleId') roleId: string,
  ) {
    return this.authService.assignRoleToUser(
      { userId, roleId },
      extractAuthToken(request),
    );
  }

  @Delete('users/:userId/roles/:roleId')
  @RequirePermissions('ROLE_REMOVE')
  removeRoleFromUser(
    @Req() request: AuthenticatedRequest,
    @Param('userId') userId: string,
    @Param('roleId') roleId: string,
  ) {
    return this.authService.removeRoleFromUser(
      { userId, roleId },
      extractAuthToken(request),
    );
  }

  @Get('users/:id/permissions')
  @RequirePermissions('PERMISSION_READ')
  getUserPermissions(
    @Req() request: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    return this.authService.getUserPermissions(
      { userId: id },
      extractAuthToken(request),
    );
  }

  @Get('permissions')
  @RequirePermissions('PERMISSION_READ')
  listPermissions(@Req() request: AuthenticatedRequest) {
    return this.authService.listPermissions(extractAuthToken(request));
  }
}
