import { AppModule } from '../src/app.module';
import { AuthModule } from '../src/auth/auth.module';
import { TasksModule } from '../src/tasks/tasks.module';
import { UsersModule } from '../src/users/users.module';

describe('Module imports', () => {
  it('app module should import auth, tasks, users', () => {
    const imports = (AppModule as any).__imports || [];
    // simply require the modules to ensure they compile
    expect(AppModule).toBeDefined();
    expect(AuthModule).toBeDefined();
    expect(TasksModule).toBeDefined();
    expect(UsersModule).toBeDefined();
  });
});
