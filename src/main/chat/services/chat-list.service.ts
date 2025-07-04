import { Injectable } from '@nestjs/common';
import { DbService } from 'src/utils/db/db.service';

@Injectable()
export class ChatListService {
  constructor(private readonly db: DbService) {}

  public async getChatsList(userId: string,) {
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
                  },
                },
              },
            },
            clientProfile: {
              select: {
                profilePic: {
                  select: {
                    path: true,
                  },
                },
              },
            },
            adminProfile: {
              select: {
                profilePic: {
                  select: {
                    path: true,
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
                  },
                },
              },
            },
            clientProfile: {
              select: {
                profilePic: {
                  select: {
                    path: true,
                  },
                },
              },
            },
            adminProfile: {
              select: {
                profilePic: {
                  select: {
                    path: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Transform conversations to include chat metadata
    let allChats = conversations.map((c) => ({
      type: 'conversation' as const,
      id: c.id,
      lastMessageDate: c.lasMessage?.createdAt ?? new Date(0),
      data: {
        ...c,
        // Add helper to get the other user's profile picture
        otherUser: c.memberOneId === userId ? c.memberTwo : c.memberOne,
        otherUserProfilePic: this.getProfilePicture(
          c.memberOneId === userId ? c.memberTwo : c.memberOne
        ),
      },
    }));

    // Sort by last message date (most recent first)
    return allChats.sort((a, b) => b.lastMessageDate.getTime() - a.lastMessageDate.getTime());

  }

  private getProfilePicture(user: any): string | null {
    // Check for profile picture in order of priority
    if (user.workerProfile?.profilePic?.path) {
      return user.workerProfile.profilePic.path;
    }
    if (user.clientProfile?.profilePic?.path) {
      return user.clientProfile.profilePic.path;
    }
    if (user.adminProfile?.profilePic?.path) {
      return user.adminProfile.profilePic.path;
    }
    return null;
  }
}