import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SafeUserDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'learner@example.com' })
  email!: string;

  @ApiPropertyOptional({ example: 'Minh', nullable: true })
  displayName!: string | null;
}

export class AuthResponseDto {
  @ApiProperty({ description: 'Short-lived access credential' })
  accessToken!: string;

  @ApiPropertyOptional({
    description:
      'Returned only to native clients. Web refresh is an HttpOnly cookie.',
  })
  refreshToken?: string;

  @ApiProperty({ type: SafeUserDto })
  user!: SafeUserDto;
}

export class RefreshResponseDto {
  @ApiProperty({ description: 'Short-lived access credential' })
  accessToken!: string;

  @ApiPropertyOptional({
    description: 'Rotated credential returned only to native clients.',
  })
  refreshToken?: string;
}
