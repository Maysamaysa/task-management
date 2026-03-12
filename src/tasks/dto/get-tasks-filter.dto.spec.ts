import { validate } from 'class-validator';
import { GetTasksFilterDto } from './get-tasks-filter.dto';
import { TaskStatus } from '../entities/task.entity';

describe('GetTasksFilterDto', () => {
    it('should validate a correct filter', async () => {
        const dto = new GetTasksFilterDto();
        dto.status = TaskStatus.DONE;

        const errors = await validate(dto);
        expect(errors.length).toBe(0);
    });

    it('should fail if status is invalid', async () => {
        const dto = new GetTasksFilterDto();
        (dto as any).status = 'INVALID';
        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
    });

    it('should allow optional status', async () => {
        const dto = new GetTasksFilterDto();
        const errors = await validate(dto);
        expect(errors.length).toBe(0);
    });
});
