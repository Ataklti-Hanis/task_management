import {
  IsDateString,
  isEnum,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';
import { TaskStatus } from './create-task-dto';

export class UpdateTaskDto {
  @IsString()
  @IsOptional()
  title: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsEnum(TaskStatus, {
    message: `Status must be one of ${Object.values(TaskStatus).join(',')}`,
  })
  @IsOptional()
  status: TaskStatus;

  @IsDateString()
  @IsOptional()
  dueDate: string;
}
