import { User } from '@/models';

describe('User Model', () => {
  describe('Validation', () => {
    it('should create user with valid data', async () => {
      const user = new User({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123!',
        role: 'patient',
      });

      await expect(user.save()).resolves.toBeDefined();
    });

    it('should require name', async () => {
      const user = new User({
        email: 'test@example.com',
        password: 'Password123!',
        role: 'patient',
      });

      await expect(user.save()).rejects.toThrow();
    });

    it('should require email', async () => {
      const user = new User({
        name: 'Test User',
        password: 'Password123!',
        role: 'patient',
      });

      await expect(user.save()).rejects.toThrow();
    });

    it('should require valid email format', async () => {
      const user = new User({
        name: 'Test User',
        email: 'invalid-email',
        password: 'Password123!',
        role: 'patient',
      });

      await expect(user.save()).rejects.toThrow();
    });

    it('should require unique email', async () => {
      await User.create({
        name: 'User 1',
        email: 'unique@example.com',
        password: 'Password123!',
        role: 'patient',
      });

      const duplicate = new User({
        name: 'User 2',
        email: 'unique@example.com',
        password: 'Password123!',
        role: 'patient',
      });

      await expect(duplicate.save()).rejects.toThrow();
    });

    it('should validate role enum', async () => {
      const user = new User({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123!',
        role: 'invalid-role' as any,
      });

      await expect(user.save()).rejects.toThrow();
    });
  });

  describe('Password Hashing', () => {
    it('should hash password before saving', async () => {
      const plainPassword = 'PlainPassword123!';
      const user = await User.create({
        name: 'Hash Test',
        email: 'hash@example.com',
        password: plainPassword,
        role: 'patient',
      });

      const savedUser = await User.findById(user._id).select('+password');
      expect(savedUser?.password).not.toBe(plainPassword);
      expect(savedUser?.password).toMatch(/^\$2[aby]\$/); // bcrypt hash pattern
    });

    it('should not rehash password if not modified', async () => {
      const user = await User.create({
        name: 'No Rehash',
        email: 'norehash@example.com',
        password: 'Password123!',
        role: 'patient',
      });

      const firstHash = (await User.findById(user._id).select('+password'))
        ?.password;

      user.name = 'Updated Name';
      await user.save();

      const secondHash = (await User.findById(user._id).select('+password'))
        ?.password;

      expect(firstHash).toBe(secondHash);
    });
  });

  describe('comparePassword', () => {
    it('should return true for correct password', async () => {
      const password = 'CorrectPassword123!';
      const user = await User.create({
        name: 'Compare Test',
        email: 'compare@example.com',
        password,
        role: 'patient',
      });

      const userWithPassword = await User.findById(user._id).select(
        '+password'
      );
      const isMatch = await userWithPassword?.comparePassword(password);

      expect(isMatch).toBe(true);
    });

    it('should return false for incorrect password', async () => {
      const user = await User.create({
        name: 'Compare Test',
        email: 'compare2@example.com',
        password: 'CorrectPassword123!',
        role: 'patient',
      });

      const userWithPassword = await User.findById(user._id).select(
        '+password'
      );
      const isMatch = await userWithPassword?.comparePassword('WrongPassword!');

      expect(isMatch).toBe(false);
    });
  });

  describe('Account Locking', () => {
    it('should lock account after max login attempts', async () => {
      const user = await User.create({
        name: 'Lock Test',
        email: 'lock@example.com',
        password: 'Password123!',
        role: 'patient',
      });

      // Simulate failed login attempts
      for (let i = 0; i < 5; i++) {
        await user.incrementLoginAttempts();
      }

      const lockedUser = await User.findById(user._id);
      expect(lockedUser?.isLocked()).toBe(true);
    });
  });

  describe('Token Generation', () => {
    it('should generate password reset token', async () => {
      const user = await User.create({
        name: 'Token Test',
        email: 'token@example.com',
        password: 'Password123!',
        role: 'patient',
      });

      const token = user.generatePasswordResetToken();

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
    });

    it('should generate email verification token', async () => {
      const user = await User.create({
        name: 'Verify Test',
        email: 'verify@example.com',
        password: 'Password123!',
        role: 'patient',
      });

      const token = user.generateEmailVerificationToken();

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
    });
  });
});
