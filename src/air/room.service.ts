import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoomEntity } from 'src/entitiy/room.entity';
import { RegisterRoomDto } from 'src/dto';
import { HeartBeatRequestDto } from 'src/dto/heartbeat.dto';

@Injectable()
export class RoomService {
  constructor(
    @InjectRepository(RoomEntity)
    private roomRepository: Repository<RoomEntity>,
  ) {}

  async registerRoom(registerRoomDto: RegisterRoomDto) {
    if (await this.findRoom(registerRoomDto.room)) {
      return;
    }
    var newRoom = this.roomRepository.create();
    newRoom.roomName = registerRoomDto.room;
    newRoom.isPowerOn = false;
    newRoom.isServicing = false;
    newRoom.lastOnTime = new Date();
    newRoom.targetTemperature = 0;
    newRoom.currentTemperature = 0;
    newRoom.fanSpeed = 1;

    try {
      await this.roomRepository.save(newRoom);
    } catch (err) {
      // TODO: Nothing
    }
  }

  async findRoom(roomName: string): Promise<RoomEntity | undefined> {
    return this.roomRepository.findOne({ roomName: roomName });
  }

  async getRooms(): Promise<RoomEntity[]> {
    return this.roomRepository.find();
  }

  async findIdByName(roomName: string): Promise<number | undefined> {
    const room = await this.roomRepository.findOne({ roomName: roomName });
    if (room) {
      return room.id;
    }
    return undefined;
  }

  async updateRoomStatus(status: HeartBeatRequestDto) {
    var room = await this.findRoom(status.room);

    if (room) {
      room.currentTemperature = status.current;
      room.targetTemperature = status.target;
      room.fanSpeed = status.wind;
      room.isPowerOn = status.power;
      this.roomRepository.save(room);
    }
  }

  async updateRoomIsServicing(roomId: number, isServicing: boolean) {
    var room = await this.roomRepository.findOne({ id: roomId });

    if (room) {
      if (room.isServicing == false && isServicing) {
        room.lastOnTime = new Date();
      }
      room.isServicing = isServicing;
      this.roomRepository.save(room);
    }
  }

  async getRoomStatus(): Promise<RoomEntity[]> {
    const rooms = await this.roomRepository.find();
    return rooms;
  }
}
