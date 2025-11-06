import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwtService: JwtService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('hashPassword', () => {
    it('should hash password successfully', async () => {
      const password = 'TestPass123!';
      const hash = await service.hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(50); // Bcrypt hashes are long
    });

    it('should generate different hashes for same password', async () => {
      const password = 'TestPass123!';
      const hash1 = await service.hashPassword(password);
      const hash2 = await service.hashPassword(password);

      expect(hash1).not.toBe(hash2); // Salt makes each hash unique
    });
  });

  describe('comparePassword', () => {
    it('should return true for correct password', async () => {
      const password = 'TestPass123!';
      const hash = await service.hashPassword(password);
      const result = await service.comparePassword(password, hash);

      expect(result).toBe(true);
    });

    it('should return false for incorrect password', async () => {
      const password = 'TestPass123!';
      const hash = await service.hashPassword(password);
      const result = await service.comparePassword('WrongPass456!', hash);

      expect(result).toBe(false);
    });
  });

  describe('register', () => {
    it('should register new user successfully', async () => {
      const registerDto = {
        email: 'test@example.com',
        password: 'TestPass123!',
        fullName: 'Test User',
      };

      const mockUser = {
        id: 'uuid',
        email: registerDto.email,
        fullName: registerDto.fullName,
        role: 'admin',
        passwordHash: 'hashed_password',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(mockUser);

      const result = await service.register(registerDto);

      expect(result.user.email).toBe(registerDto.email);
      expect(result.message).toBe('User registered successfully');
      expect(mockPrismaService.user.create).toHaveBeenCalled();
    });

    it('should throw ConflictException if user exists', async () => {
      const registerDto = {
        email: 'existing@example.com',
        password: 'TestPass123!',
      };

      mockPrismaService.user.findUnique.mockResolvedValue({ id: 'existing-uuid' });

      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('login', () => {
    it('should login user and return JWT token', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'TestPass123!',
      };

      const passwordHash = await service.hashPassword(loginDto.password);
      const mockUser = {
        id: 'uuid',
        email: loginDto.email,
        fullName: 'Test User',
        role: 'admin',
        passwordHash,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLoginAt: null,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('mock_jwt_token');

      const result = await service.login(loginDto);

      expect(result.accessToken).toBe('mock_jwt_token');
      expect(result.user.email).toBe(loginDto.email);
      expect(mockPrismaService.user.update).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException for invalid email', async () => {
      const loginDto = {
        email: 'nonexistent@example.com',
        password: 'TestPass123!',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'WrongPass456!',
      };

      const correctPasswordHash = await service.hashPassword('CorrectPass123!');
      const mockUser = {
        id: 'uuid',
        email: loginDto.email,
        passwordHash: correctPasswordHash,
        isActive: true,
        role: 'admin',
        fullName: 'Test User',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLoginAt: null,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for inactive user', async () => {
      const loginDto = {
        email: 'inactive@example.com',
        password: 'TestPass123!',
      };

      const mockUser = {
        id: 'uuid',
        email: loginDto.email,
        passwordHash: 'hash',
        isActive: false,
        role: 'admin',
        fullName: 'Inactive User',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLoginAt: null,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user data', async () => {
      const mockUser = {
        id: 'uuid',
        email: 'test@example.com',
        fullName: 'Test User',
        role: 'admin',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.getCurrentUser('uuid');

      expect(result.email).toBe(mockUser.email);
      expect(result.id).toBe(mockUser.id);
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.getCurrentUser('non-existent-id')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});

