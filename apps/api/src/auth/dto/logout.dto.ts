import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class LogoutDto {
  @ApiPropertyOptional({
    description: 'Native refresh credential. Omit on Web.',
  })
  @IsOptional()
  @IsString()
  @MinLength(32)
  @MaxLength(2048)
  refreshToken?: string;
}
