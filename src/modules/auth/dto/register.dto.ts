import { ApiProperty } from '@nestjs/swagger';
import { z } from 'zod';

export const RegisterSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number',
    ),
  fullName: z.string().min(2, 'Full name must be at least 2 characters').optional(),
});

export type RegisterDto = z.infer<typeof RegisterSchema>;

export class RegisterDtoClass implements RegisterDto {
  @ApiProperty({ example: 'admin@terraindustries.com' })
  email: string;

  @ApiProperty({ example: 'SecurePass123!', minLength: 8 })
  password: string;

  @ApiProperty({ example: 'Admin User', required: false })
  fullName?: string;
}

