import { Transform } from 'class-transformer';
import { IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsCodePointLength } from '../validation/code-point-length.decorator';

export class LoginDto {
  @ApiProperty({ example: 'learner@example.com', maxLength: 254 })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsEmail()
  @IsCodePointLength(1, 254)
  email!: string;

  @ApiProperty({
    maxLength: 128,
    description: 'Exact password value; not transformed',
  })
  @IsString()
  @IsCodePointLength(1, 128)
  password!: string;
}
