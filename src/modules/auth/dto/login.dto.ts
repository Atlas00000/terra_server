import { ApiProperty } from '@nestjs/swagger';
import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginDto = z.infer<typeof LoginSchema>;

export class LoginDtoClass implements LoginDto {
  @ApiProperty({ example: 'admin@terraindustries.com' })
  email: string;

  @ApiProperty({ example: 'SecurePass123!' })
  password: string;
}

