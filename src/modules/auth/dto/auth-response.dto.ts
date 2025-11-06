import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: 'admin@terraindustries.com' })
  email: string;

  @ApiProperty({ example: 'Admin User' })
  fullName: string | null;

  @ApiProperty({ example: 'admin' })
  role: string;

  @ApiProperty({ example: '2025-11-04T10:30:00.000Z' })
  createdAt: Date;
}

export class LoginResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken: string;

  @ApiProperty({ example: '7d' })
  expiresIn: string;

  @ApiProperty({ type: UserResponseDto })
  user: UserResponseDto;
}

export class RegisterResponseDto {
  @ApiProperty({ type: UserResponseDto })
  user: UserResponseDto;

  @ApiProperty({ example: 'User registered successfully' })
  message: string;
}

