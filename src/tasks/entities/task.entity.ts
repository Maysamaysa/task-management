/* istanbul ignore file */
import {
    Column,
    Model,
    Table,
    DataType,
    CreatedAt,
    UpdatedAt,
    Default,
    ForeignKey,
    BelongsTo,
} from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';
import { User } from 'src/users/entities/user.entity';

export enum TaskStatus {
    TODO = 'TODO',
    IN_PROGRESS = 'IN_PROGRESS',
    DONE = 'DONE',
}

@Table({ tableName: 'tasks', timestamps: true })
export class Task extends Model {
    @Default(uuidv4)
    @Column({
        type: DataType.UUID,
        primaryKey: true,
        allowNull: false,
    })
    declare id: string;

    @Column({
        type: DataType.STRING(255),
        allowNull: false,
    })
    declare title: string;

    @Column({
        type: DataType.TEXT,
        allowNull: true,
    })
    declare description: string;

    @Default(TaskStatus.TODO)
    @Column({
        type: DataType.ENUM(...Object.values(TaskStatus)),
        allowNull: false,
    })
    declare status: TaskStatus;

    @ForeignKey(() => User)
    @Column({
        type: DataType.UUID,
        allowNull: false,
    })
    declare userId: string;

    @BelongsTo(() => User)
    user: User;

    @CreatedAt
    declare createdAt: Date;

    @UpdatedAt
    declare updatedAt: Date;
}
