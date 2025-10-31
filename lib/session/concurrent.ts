import { ActiveSession } from '@/types';

class SessionManager {
  private sessions: Map<string, ActiveSession> = new Map();
  private maxConcurrent = parseInt(process.env.CONCURRENT_USERS || '10');

  async acquireSession(userId: string, projectId: string): Promise<boolean> {
    // Limpiar sesiones inactivas (>30 min)
    this.cleanInactiveSessions();

    if (this.sessions.size >= this.maxConcurrent) {
      const userSession = this.sessions.get(userId);
      if (!userSession) {
        return false; // No hay espacio para nueva sesión
      }
    }

    this.sessions.set(userId, {
      userId,
      projectId,
      startedAt: new Date(),
      lastActivity: new Date(),
    });

    return true;
  }

  updateActivity(userId: string): void {
    const session = this.sessions.get(userId);
    if (session) {
      session.lastActivity = new Date();
    }
  }

  releaseSession(userId: string): void {
    this.sessions.delete(userId);
  }

  getActiveCount(): number {
    this.cleanInactiveSessions();
    return this.sessions.size;
  }

  private cleanInactiveSessions(): void {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

    for (const [userId, session] of this.sessions) {
      if (session.lastActivity < thirtyMinutesAgo) {
        this.sessions.delete(userId);
      }
    }
  }
}

export const sessionManager = new SessionManager();

