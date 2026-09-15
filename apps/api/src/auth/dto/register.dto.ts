import { Transform } from 'class-transformer';
import { IsEmail, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsCodePointLength } from '../validation/code-point-length.decorator';

export class RegisterDto {
  @ApiProperty({ example: 'learner@example.com', maxLength: 254 })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsEmail()
  @IsCodePointLength(1, 254)
  email!: string;

  @ApiProperty({
    minLength: 15,
    maxLength: 128,
    description: '15–128 Unicode code points; value is not transformed',
  })
  @IsString()
  @IsCodePointLength(15, 128)
  password!: string;

  @ApiPropertyOptional({ example: 'Minh', maxLength: 80, nullable: true })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsOptional()
  @IsString()
  @IsCodePointLength(0, 80)
  displayName?: string;
}
