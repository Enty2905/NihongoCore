import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class RefreshDto {
  @ApiPropertyOptional({
    description:
      'Native refresh credential. Omit on Web; never expose a real value in documentation.',
  })
  @IsOptional()
  @IsString()
  @MinLength(32)
  @MaxLength(2048)
  refreshToken?: string;
}
