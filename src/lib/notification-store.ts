type Subscriber = {
  id: string;
  send: (data: string) => void;
};

class NotificationStore {
  private subscribers: Map<string, Subscriber[]> = new Map();

  subscribe(userId: string, send: (data: string) => void) {
    const subs = this.subscribers.get(userId) || [];
    const subscriber: Subscriber = { id: crypto.randomUUID(), send };
    subs.push(subscriber);
    this.subscribers.set(userId, subs);
    
    return () => {
      const current = this.subscribers.get(userId) || [];
      const filtered = current.filter(s => s.id !== subscriber.id);
      if (filtered.length === 0) {
        this.subscribers.delete(userId);
      } else {
        this.subscribers.set(userId, filtered);
      }
    };
  }

  notify(userId: string, data: any) {
    const subs = this.subscribers.get(userId);
    if (subs) {
      const event = `data: ${JSON.stringify({
        ...data,
        timestamp: new Date().toISOString()
      })}\n\n`;
      
      subs.forEach(sub => {
        try {
          sub.send(event);
        } catch (e) {
          // Subscriber disconnected
        }
      });
    }
  }
}

export const notificationStore = new NotificationStore();