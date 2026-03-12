import { validate } from 'class-validator';
import { CreateTaskDto } from './create-task.dto';
import { TaskStatus } from '../entities/task.entity';

describe('CreateTaskDto', () => {
  it('should validate a correct DTO', async () => {
    const dto = new CreateTaskDto();
    dto.title = 'Valid title';
    dto.description = 'Valid description';
    dto.status = TaskStatus.TODO;

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail if title is missing', async () => {
    const dto = new CreateTaskDto();
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail if title is too long', async () => {
    const dto = new CreateTaskDto();
    dto.title = 'a'.repeat(256);
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should fail if status is invalid', async () => {
    const dto = new CreateTaskDto();
    dto.title = 'Title';
    (dto as any).status = 'INVALID_STATUS';
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});
