import { IsDateString, IsEnum, IsOptional } from 'class-validator';
import { TaskStatus } from './create-task-dto';
import { Task } from '../create-task-entity';

export class GetTasksFilterDto {
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @IsDateString()
  dueDate?: string;
}
