import { validate } from 'class-validator';
import { CreateUserDto } from './create-user.dto';
import { UserRole } from '../entities/user.entity';

describe('CreateUserDto', () => {
  it('should validate a correct DTO', async () => {
    const dto = new CreateUserDto();
    dto.email = 'test@example.com';
    dto.password = 'Str0ng@Pass';
    dto.firstName = 'John';
    dto.lastName = 'Doe';
    dto.role = UserRole.EMPLOYEE;

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail if email is invalid', async () => {
    const dto = new CreateUserDto();
    dto.email = 'invalid-email';
    dto.password = 'Str0ng@Pass';
    dto.firstName = 'John';
    dto.lastName = 'Doe';
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail if password does not meet requirements', async () => {
    const dto = new CreateUserDto();
    dto.email = 'test@example.com';
    dto.password = 'weak';
    dto.firstName = 'John';
    dto.lastName = 'Doe';
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail if firstName is missing', async () => {
    const dto = new CreateUserDto();
    dto.email = 'test@example.com';
    dto.password = 'Str0ng@Pass';
    dto.lastName = 'Doe';
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});
