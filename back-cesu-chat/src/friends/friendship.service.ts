import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Friendship } from './friendship.entity';
import { FriendshipRequest } from './friendship.request'; 
import { User } from '../users/user.entity'; 

@Injectable()
export class FriendshipService {
  constructor(
    @InjectRepository(Friendship)
    private readonly friendshipRepository: Repository<Friendship>,

    @InjectRepository(FriendshipRequest)
    private readonly friendshipRequestRepository: Repository<FriendshipRequest>,
  ) {}

  async areFriends(userId: number, friendId: number): Promise<boolean> {
    const friendship = await this.friendshipRepository.findOne({
      where: [
        { user: { id: userId }, friend: { id: friendId } },
        { user: { id: friendId }, friend: { id: userId } },
      ],
    });
    return !!friendship;
  }

  async sendFriendshipRequest(from: User, to: User): Promise<FriendshipRequest> {
    const request = this.friendshipRequestRepository.create({ from, to });
    return await this.friendshipRequestRepository.save(request);
  }

  async acceptFriendshipRequest(requestId: number): Promise<void> {
    const request = await this.friendshipRequestRepository.findOne({ where: { id: requestId } });
    if (request) {
      request.status = 'accepted';
      await this.friendshipRequestRepository.save(request);
  
      const friendship = new Friendship();
      friendship.user = request.from; 
      friendship.friend = request.to; 
      await this.friendshipRepository.save(friendship);
    }
  }

  async declineFriendshipRequest(requestId: number): Promise<void> {
    const request = await this.friendshipRequestRepository.findOne({ where: { id: requestId } });
    if (request) {
      request.status = 'declined';
      await this.friendshipRequestRepository.save(request);
    }
  }

  async getPendingRequests(userId: number): Promise<FriendshipRequest[]> {
    return await this.friendshipRequestRepository.find({ where: { to: { id: userId }, status: 'pending' } });
  }
}