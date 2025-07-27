import {
  BadRequestException,
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
import {
  IPaginationOptions,
  paginate,
  Pagination,
} from 'nestjs-typeorm-paginate';
import { GetTasksFilterDto } from './dto/filter-task-dto';

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
    // task.dueDate = taskDto.dueDate;

    // if (taskDto.status === TaskStatus.DONE && taskDto.dueDate) {
    //   task.dueDate = new Date(taskDto.dueDate);
    // } else {
    //   task.dueDate = undefined;
    // }
    task.dueDate = taskDto.status === TaskStatus.DONE ? new Date() : null;
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

  async updateStatus(
    id: number,
    status: TaskStatus,
    dueDate?: string,
  ): Promise<UpdateResult> {
    if (!Object.values(TaskStatus).includes(status as TaskStatus)) {
      throw new HttpException('Invalid Status', HttpStatus.BAD_REQUEST);
    }
    const updateData: Partial<Task> = {
      status,
      dueDate: status === TaskStatus.DONE ? new Date() : null,
    };

    if (status === TaskStatus.DONE) {
      updateData.dueDate = new Date(); // system sets dueDate automatically
    } else {
      updateData.dueDate = null; // clear dueDate if not DONE
    }
    const taskToUpdate = await this.taskRepository.update(id, updateData);
    if (taskToUpdate.affected === 0) {
      throw new NotFoundException('Task not found');
    }
    return taskToUpdate;
  }

  async paginate(options: IPaginationOptions): Promise<Pagination<Task>> {
    const queryBuilder = this.taskRepository.createQueryBuilder('c');
    queryBuilder
      .orderBy(
        `
      CASE c.status
        WHEN 'DONE' THEN 1
        WHEN 'TODO' THEN 2
        WHEN 'IN_PROGRESS' THEN 3
        WHEN 'CANCELLED' THEN 4
        ELSE 5
      END
    `,
        'ASC',
      )
      .addOrderBy('c.dueDate', 'ASC');
    return paginate<Task>(queryBuilder, options);
  }
}
