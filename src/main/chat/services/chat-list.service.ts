import { Injectable } from '@nestjs/common';
import { DbService } from 'src/utils/db/db.service';

@Injectable()
export class ChatListService {
  constructor(private readonly db: DbService) {}

  public async getChatsList(userId: string) {
    // Fetch Conversations where the user is a member
    const conversations = await this.db.conversation.findMany({
      where: {
        OR: [{ memberOneId: userId }, { memberTwoId: userId }],
      },
      include: {
        lasMessage: {
          select: {
            content: true,
            id: true,
            createdAt: true,
          },
        },
        memberOne: {
          select: {
            id: true,
            name: true,
            workerProfile: {
              select: {
                profilePic: {
                  select: {
                    path: true,
                    url: true,
                  },
                },
              },
            },
            clientProfile: {
              select: {
                profilePic: {
                  select: {
                    path: true,
                    url: true,
                  },
                },
              },
            },
            adminProfile: {
              select: {
                profilePic: {
                  select: {
                    path: true,
                    url: true,
                  },
                },
              },
            },
          },
        },
        memberTwo: {
          select: {
            id: true,
            name: true,
            workerProfile: {
              select: {
                profilePic: {
                  select: {
                    path: true,
                    url: true,
                  },
                },
              },
            },
            clientProfile: {
              select: {
                profilePic: {
                  select: {
                    path: true,
                    url: true,
                  },
                },
              },
            },
            adminProfile: {
              select: {
                profilePic: {
                  select: {
                    path: true,
                    url: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Remove duplicates by using a Set to track unique conversation IDs
    const uniqueConversations = new Map();
    
    conversations.forEach((conversation) => {
      if (!uniqueConversations.has(conversation.id)) {
        uniqueConversations.set(conversation.id, conversation);
      }
    });

    // Transform conversations to include chat metadata
    const allChats = Array.from(uniqueConversations.values()).map((c) => {
      const { memberTwo, memberOne, lasMessage, ...rest } = c;
      const otherUser = c.memberOneId === userId ? c.memberTwo : c.memberOne;
      
      return {
        type: 'conversation' as const,
        id: c.id,
        lastMessageDate: c.lasMessage?.createdAt ?? new Date(0),
        data: {
          ...rest,
          otherUser: {
            id: otherUser.id,
            name: otherUser.name,
            profilePic: this.getProfilePicture(otherUser),
          },
          lastMessage: {
            id: c.lasMessage?.id || null,
            content: c.lasMessage?.content || 'No messages yet',
            createdAt: c.lasMessage?.createdAt || null,
          },
        },
      };
    });

    // Sort by last message date (most recent first)
    return allChats.sort(
      (a, b) => b.lastMessageDate.getTime() - a.lastMessageDate.getTime(),
    );
  }

  private getProfilePicture(user: any): { path: string | null; url: string | null } {
    // Check for profile picture in order of priority
    if (user.workerProfile?.profilePic) {
      return {
        path: user.workerProfile.profilePic.path || null,
        url: user.workerProfile.profilePic.url || null,
      };
    }
    if (user.clientProfile?.profilePic) {
      return {
        path: user.clientProfile.profilePic.path || null,
        url: user.clientProfile.profilePic.url || null,
      };
    }
    if (user.adminProfile?.profilePic) {
      return {
        path: user.adminProfile.profilePic.path || null,
        url: user.adminProfile.profilePic.url || null,
      };
    }
    
    // Return default/placeholder image info instead of null
    return {
      path: '/default-avatar.png', // You can set a default avatar path
      url: '/default-avatar.png',  // Or use a CDN URL for default avatar
    };
  }
}