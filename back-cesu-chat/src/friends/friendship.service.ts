import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Friendship } from './friendship.entity';
import { FriendshipRequest } from './friendship.request'; 
import { User } from '../users/user.entity'; 
import { UsersService } from '../users/users.service';
import { FriendshipRequestDTO } from './dto/friendship-request.dto';

@Injectable()
export class FriendshipService {
  constructor(
    @InjectRepository(Friendship)
    private readonly friendshipRepository: Repository<Friendship>,

    @InjectRepository(FriendshipRequest)
    private readonly friendshipRequestRepository: Repository<FriendshipRequest>,
    private readonly usersService: UsersService,
  ) {}

  async areFriends(userId: number, friendId: number): Promise<boolean> {
    const friendship = await this.friendshipRepository.findOne({
        where: [
            { requester: { id: userId }, receiver: { id: friendId } },
            { requester: { id: friendId }, receiver: { id: userId } },
        ],
    });
    return !!friendship;
  }

  async getUserIdByUsername(username: string): Promise<number | null> {
    const user = await this.usersService.findOneByUsername(username); 
    return user ? user.id : null; 
}


  async deleteFriend(userId: string, friendId: string): Promise<void> {
    const userIdNumber = Number(userId);
    const friendIdNumber = Number(friendId);

    const friendship = await this.friendshipRepository.findOne({
        where: [
            { requester: { id: userIdNumber }, receiver: { id: friendIdNumber } },
            { requester: { id: friendIdNumber }, receiver: { id: userIdNumber } },
        ],
    });

    if (friendship) {
        await this.friendshipRepository.remove(friendship);
        console.log(`Amigo ${friendId} excluído para o usuário ${userId}`);
    } else {
        console.log(`Amizade não encontrada entre ${userId} e ${friendId}`);
    }
  }

  async sendFriendshipRequest(fromUserId: number, toUserId: number): Promise<FriendshipRequest> {
    const fromUser = await this.usersService.findOne(fromUserId);
    const toUser = await this.usersService.findOne(toUserId);
    
    if (!fromUser || !toUser) {
        throw new NotFoundException('Um dos usuários não existe.');
    }

    const areAlreadyFriends = await this.areFriends(fromUserId, toUserId);
    if (areAlreadyFriends) {
        throw new Error('Você já é amigo desta pessoa.');
    }

    const existingRequest = await this.friendshipRequestRepository.findOne({
        where: [
            { from: { id: fromUserId }, to: { id: toUserId }, status: 'pending' },
            { from: { id: toUserId }, to: { id: fromUserId }, status: 'pending' },
        ]
    });
    
    if (existingRequest) {
        throw new Error('Já existe uma solicitação de amizade pendente entre vocês.');
    }

    const request = this.friendshipRequestRepository.create({
        from: fromUser,
        to: toUser,
        status: 'pending',
    });

    return await this.friendshipRequestRepository.save(request);
  }

  async acceptFriendshipRequest(requestId: number): Promise<void> {
    const request = await this.friendshipRequestRepository.findOne({ 
      where: { id: requestId }, 
      relations: ['from', 'to'] 
    });
  
    if (!request) {
      throw new NotFoundException('Solicitação de amizade não encontrada.');
    }
  
    if (request.status === 'accepted') {
      throw new Error('Solicitação já foi aceita.');
    }
  
    request.status = 'accepted';
    await this.friendshipRequestRepository.save(request);
  
    const friendship = this.friendshipRepository.create({
      requester: request.from,
      receiver: request.to,
    });
  
    await this.friendshipRepository.save(friendship);
  }

  async getFriends(userId: number): Promise<User[]> {
    const friendships = await this.friendshipRepository.find({
        where: [
            { requester: { id: userId } },   
            { receiver: { id: userId } }   
        ],
        relations: ['receiver', 'requester'] 
    });

    const friends = friendships.map(friendship => 
        friendship.requester.id === userId ? friendship.receiver : friendship.requester
    );

    console.log("Amigos encontrados:", friends.map(friend => friend.username));
    return friends;
  }

  async declineFriendshipRequest(requestId: number): Promise<void> {
    const request = await this.friendshipRequestRepository.findOne({ where: { id: requestId } });
    if (request) {
      request.status = 'declined';
      await this.friendshipRequestRepository.save(request);
    }
  }

  async getReceivedFriendRequests(userId: number): Promise<FriendshipRequestDTO[]> {
    const requests = await this.friendshipRequestRepository.find({
        where: { to: { id: userId }, status: 'pending' },
        relations: ['from'],
    });

    return requests.map(request => ({
        id: request.id,
        fromId: request.from.id, 
        fromUsername: request.from.username,
        status: request.status,
    }));
}

  async getRequestsWithUsernames(requests: FriendshipRequest[]): Promise<any[]> {
    return Promise.all(requests.map(async request => {
      const fromUser = await this.usersService.findOne(request.from.id);
      return {
        id: request.id,
        fromUsername: fromUser?.username,
        status: request.status,
      };
    }));
  }
}
