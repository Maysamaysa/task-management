/* istanbul ignore file */
import {
    Column,
    Model,
    Table,
    DataType,
    CreatedAt,
    UpdatedAt,
    Unique,
    Default,
    HasMany,
} from 'sequelize-typescript';

export enum UserRole {
    ADMIN = 'admin',
    EMPLOYEE = 'employee',
}
import { v4 as uuidv4 } from 'uuid';
import { Task } from 'src/tasks/entities/task.entity';

@Table({ tableName: 'users', timestamps: true })
export class User extends Model {
    @Default(uuidv4)
    @Column({
        type: DataType.UUID,
        primaryKey: true,
        allowNull: false,
    })
    declare id: string;

    @Unique
    @Column({
        type: DataType.STRING,
        allowNull: false,
        validate: {
            isEmail: true,
        },
    })
    declare email: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    declare password: string;

    @Column({
        type: DataType.STRING(100),
        allowNull: false,
    })
    declare firstName: string;

    @Column({
        type: DataType.STRING(100),
        allowNull: false,
    })
    declare lastName: string;

    @CreatedAt
    declare createdAt: Date;

    @UpdatedAt
    declare updatedAt: Date;

    @HasMany(() => Task, { onDelete: 'CASCADE' })
    tasks: Task[];

    @Default(UserRole.EMPLOYEE)
    @Column({
        type: DataType.ENUM(...Object.values(UserRole)),
        allowNull: false,
    })
    declare role: UserRole;
}