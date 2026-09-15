import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiHeader,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import type { AuthenticatedContext } from './common/auth-context';
import { CurrentUser } from './common/current-user.decorator';
import {
  AuthResponseDto,
  RefreshResponseDto,
  SafeUserDto,
} from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { LogoutDto } from './dto/logout.dto';
import { RefreshDto } from './dto/refresh.dto';
import { RegisterDto } from './dto/register.dto';
import { AccessAuthGuard } from './guards/access-auth.guard';
import {
  AuthTransportService,
  type ClientPlatform,
} from './transport/auth-transport.service';
import { authExceptions } from './common/auth-exceptions';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly transport: AuthTransportService,
  ) {}

  @Post('register')
  @UseGuards(ThrottlerGuard)
  @ApiOperation({ summary: 'Create an account and authenticated session' })
  @ApiHeader({ name: 'X-Client-Platform', enum: ['web', 'native'] })
  @ApiCreatedResponse({ type: AuthResponseDto })
  @ApiConflictResponse({ description: 'EMAIL_ALREADY_EXISTS' })
  async register(
    @Body() body: RegisterDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthResponseDto> {
    const platform = this.transport.validatePost(request);
    return this.deliverAuthentication(
      platform,
      response,
      await this.auth.register(body),
    );
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(ThrottlerGuard)
  @ApiOperation({ summary: 'Create an independent authenticated session' })
  @ApiHeader({ name: 'X-Client-Platform', enum: ['web', 'native'] })
  @ApiOkResponse({ type: AuthResponseDto })
  @ApiUnauthorizedResponse({ description: 'INVALID_CREDENTIALS' })
  async login(
    @Body() body: LoginDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthResponseDto> {
    const platform = this.transport.validatePost(request);
    return this.deliverAuthentication(
      platform,
      response,
      await this.auth.login(body),
    );
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @UseGuards(ThrottlerGuard)
  @ApiOperation({ summary: 'Rotate the current refresh credential' })
  @ApiHeader({ name: 'X-Client-Platform', enum: ['web', 'native'] })
  @ApiOkResponse({ type: RefreshResponseDto })
  @ApiUnauthorizedResponse({
    description: 'INVALID_REFRESH_TOKEN or REFRESH_TOKEN_REUSED',
  })
  async refresh(
    @Body() body: RefreshDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<RefreshResponseDto> {
    const platform = this.transport.validatePost(request);
    const refreshToken = this.transport.refreshCredential(
      request,
      platform,
      body.refreshToken,
    );
    if (!refreshToken) throw authExceptions.invalidRefresh();
    const issued = await this.auth.refresh(refreshToken);
    if (platform === 'web') {
      this.transport.issueRefreshCookie(response, issued.refreshToken);
      return { accessToken: issued.accessToken };
    }
    return {
      accessToken: issued.accessToken,
      refreshToken: issued.refreshToken,
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Revoke the current proven session' })
  @ApiHeader({ name: 'X-Client-Platform', enum: ['web', 'native'] })
  @ApiNoContentResponse()
  async logout(
    @Body() body: LogoutDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    const platform = this.transport.validatePost(request);
    const refreshToken = this.transport.refreshCredential(
      request,
      platform,
      body.refreshToken,
    );
    await this.auth.logout(refreshToken);
    if (platform === 'web') this.transport.clearRefreshCookie(response);
  }

  @Get('me')
  @UseGuards(AccessAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Return the validated current user context' })
  @ApiOkResponse({ type: SafeUserDto })
  @ApiUnauthorizedResponse({ description: 'UNAUTHENTICATED' })
  me(@CurrentUser() context: AuthenticatedContext): SafeUserDto {
    return context.user;
  }

  private deliverAuthentication(
    platform: ClientPlatform,
    response: Response,
    issued: Awaited<ReturnType<AuthService['login']>>,
  ): AuthResponseDto {
    if (platform === 'web') {
      this.transport.issueRefreshCookie(response, issued.refreshToken);
      return { accessToken: issued.accessToken, user: issued.user };
    }
    return issued;
  }
}
