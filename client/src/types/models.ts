/** Shared data contracts. Types are compile-time only; runtime logic lives in functions/. */
export type AccountRole = 'Participant' | 'Organizer' | 'Admin';
export type EventVisibility = 'Draft' | 'Published';
export type TaskStatus = 'To Do' | 'In Progress' | 'Done';
export type StreamStatus = 'Scheduled' | 'Live' | 'Ended';
export interface UserAccount { id: string; name: string; email: string; studentId: string; roles: AccountRole[]; bio?: string; avatar?: string }
export interface EventRecord { id: string; ownerId: string; title: string; description: string; category: string; venue: string; start: string; end: string; deadline: string; capacity: number; visibility: EventVisibility; coOrganizers: Array<{ userId: string; permissions: string[] }>; cover?: string }
export interface EventTeam { id: string; eventId: string; name: string; managerId?: string | null; handlerIds: string[]; memberIds: string[] }
export interface TeamTask { id: string; teamId: string; title: string; description: string; assigneeId: string; due: string; status: TaskStatus }
export interface ScheduleEntry { id: string; eventId: string; title: string; startsAt: string; endsAt: string; venue: string; description?: string }
export interface ParticipationRecord { id: string; eventId: string; userId: string; verified: boolean; verifiedBy: string; verifiedAt: string }
