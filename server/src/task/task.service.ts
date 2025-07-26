import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { Task } from './create-task-entity';
import { CreateTaskDto, TaskStatus } from './dto/create-task-dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateTaskDto } from './dto/update-task-dto';
import { threadId } from 'worker_threads';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
  ) {}

  create(taskDto: CreateTaskDto): Promise<Task> {
    const task = new Task();
    task.title = taskDto.title;
    task.description = taskDto.description;
    task.status = taskDto.status;
    task.dueDate = taskDto.dueDate;

    return this.taskRepository.save(task);
  }
  findAll() {
    try {
      return this.taskRepository.find();
    } catch (err) {
      throw new HttpException(
        'Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
        {
          cause: err,
        },
      );
    }
  }

  findOne(id: number): Promise<Task | null> {
    return this.taskRepository.findOneBy({ id });
  }

  async update(id: number, taskToUpdate: UpdateTaskDto): Promise<UpdateResult> {
    const task = await this.taskRepository.update(id, taskToUpdate);
    if (task.affected === 0) {
      throw new HttpException('Task not found', HttpStatus.NOT_FOUND);
    }
    return task;
  }

  async deleteAllTasks(): Promise<{ message: string; deleted: number }> {
    try {
      await this.taskRepository.clear();
      return {
        message: 'All tasks deleted successfully.',
        deleted: -1,
      };
    } catch (err) {
      console.error('failed to delete tasks', err);
      throw new InternalServerErrorException('Could not delete task');
    }
  }

  async delete(id: number): Promise<DeleteResult> {
    const taskToDelete = await this.taskRepository.delete(id);
    if (taskToDelete.affected === 0) {
      throw new NotFoundException('Task not found');
    }
    return taskToDelete;
  }

  async updateStatus(id: number, status: string): Promise<UpdateResult> {
    if (!Object.values(TaskStatus).includes(status as TaskStatus)) {
      throw new HttpException('Invalid Status', HttpStatus.BAD_REQUEST);
    }
    const taskToUpdate = await this.taskRepository.update(id, {
      status: status as TaskStatus,
    });
    if (taskToUpdate.affected === 0) {
      throw new NotFoundException('Task not found');
    }
    return taskToUpdate;
  }
}
