import { ValidationUtil } from '../validation';

describe('ValidationUtil', () => {
  describe('validateUserRegistration', () => {
    it('should return validation chain', () => {
      const validators = ValidationUtil.validateUserRegistration();
      expect(validators).toBeDefined();
      expect(Array.isArray(validators)).toBe(true);
      expect(validators.length).toBeGreaterThan(0);
    });
  });

  describe('validateUserLogin', () => {
    it('should return validation chain', () => {
      const validators = ValidationUtil.validateUserLogin();
      expect(validators).toBeDefined();
      expect(Array.isArray(validators)).toBe(true);
      expect(validators.length).toBeGreaterThan(0);
    });
  });

  describe('validatePasswordUpdate', () => {
    it('should return validation chain', () => {
      const validators = ValidationUtil.validatePasswordUpdate();
      expect(validators).toBeDefined();
      expect(Array.isArray(validators)).toBe(true);
    });
  });
});
