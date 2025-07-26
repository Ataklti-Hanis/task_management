import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task-dto';
import { Task } from './create-task-entity';
import { UpdateTaskDto } from './dto/update-task-dto';
import { DeleteResult, UpdateResult } from 'typeorm';

@Controller('task')
export class TaskController {
  constructor(private taskService: TaskService) {}

  @Post()
  createTask(@Body() taskDto: CreateTaskDto) {
    return this.taskService.create(taskDto);
  }

  @Get()
  findAll() {
    return this.taskService.findAll();
  }
  @Get(':id')
  async findOne(@Param('id', new ParseIntPipe()) id: number): Promise<Task> {
    const task = await this.taskService.findOne(id);

    if (!task) {
      throw new NotFoundException('Task not found');
    }
    return task;
  }

  @Put(':id')
  update(
    @Param('id', new ParseIntPipe()) id: number,
    @Body() taskDto: UpdateTaskDto,
  ) {
    return this.taskService.update(id, taskDto);
  }

  @Delete('all')
  async deleteAll(): Promise<{ message: string; deleted: number }> {
    return await this.taskService.deleteAllTasks();
  }

  @Delete(':id')
  delete(@Param('id', new ParseIntPipe()) id: number): Promise<DeleteResult> {
    return this.taskService.delete(id);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id', new ParseIntPipe()) id: number,
    @Body() updateStatus: UpdateTaskDto,
  ): Promise<UpdateResult> {
    return this.taskService.updateStatus(id, updateStatus.status);
  }
}
