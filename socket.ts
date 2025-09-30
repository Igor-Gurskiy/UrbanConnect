class WebSocketService {
  ws: null | WebSocket;
  isConnected: boolean;
  reconnectedAttempts: number;
  maxReconnectedAttempts: number;
  reconnectInterval: number;
  currentUserId: null | string;

  constructor() {
    this.ws = null;
    this.isConnected = false;
    this.reconnectedAttempts = 0;
    this.maxReconnectedAttempts = 5;
    this.reconnectInterval = 5000;
    this.currentUserId = null;

    this.handleMessage = this.handleMessage.bind(this);
  }
  
  connect(userId: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN && this.currentUserId === userId) {
      return this.ws;
    }
    this.disconnect();
    try {
      this.currentUserId = userId;
      
      // Подключаемся для пользователя, а не конкретного чата
      const wsUrl = import.meta.env.VITE_WS_URL || 
  (window.location.protocol === 'https:' 
    ? `wss://${window.location.host}` 
    : `ws://${window.location.host}`);
this.ws = new WebSocket(`${wsUrl}?userId=${userId}`);

      this.ws.onopen = () => {
        this.isConnected = true;
        this.reconnectedAttempts = 0;
        console.log('WebSocket connection established');
      };
      
      this.ws.onmessage = this.handleMessage;

      this.ws.onclose = () => {
        this.isConnected = false;
        console.log('WebSocket connection closed');
        this.attemptReconnect(userId);
      };

      this.ws.onerror = (error) => {
        console.log('WebSocket error:', error);
        this.isConnected = false;
      };

      return this.ws;
    } catch (error) {
      console.log('WebSocket connection error:', error);
      return null;
    }
  }
  private handleMessage(event: MessageEvent) {
    try {
      const data = JSON.parse(event.data);
      console.log('Received WebSocket message:', data);
      
      if (!data || !data.type) {
        console.warn('Invalid WebSocket message format');
        return;
      }
      
      const customEvent = new CustomEvent('websocket-message', {
        detail: data
      });
      window.dispatchEvent(customEvent);
    } catch (error) {
      console.log('Error parsing message:', error);
    }
  }

  private attemptReconnect(userId: string) {
    if (this.reconnectedAttempts < this.maxReconnectedAttempts) {
      setTimeout(() => {
        this.reconnectedAttempts++;
        console.log(`Reconnecting... Attempt ${this.reconnectedAttempts}/${this.maxReconnectedAttempts}`);
        this.connect(userId);
      }, this.reconnectInterval);
    } else {
      console.log('Max reconnection attempts reached');
    }
  }
  disconnect() {
    if (this.ws) {
      this.ws.onclose = null;
      this.ws.close();
      this.ws = null;
      this.isConnected = false;
      this.currentUserId = null;
    }
  }
}

export const webSocketService = new WebSocketService();