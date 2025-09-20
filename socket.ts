class WebSocketService {
  ws: null | WebSocket;
  isConnected: boolean;
  reconnectedAttempts: number;
  maxReconnectedAttempts: number;
  reconnectInterval: number;
  currentChatId: null | string;
  currentUserId: null | string;
  constructor() {
    this.ws = null;
    this.isConnected = false;
    this.reconnectedAttempts = 0;
    this.maxReconnectedAttempts = 5;
    this.reconnectInterval = 5000;
    this.currentChatId = null;
    this.currentUserId = null;
  }

  connect(chatId: string, userId: string) {
     if (this.ws && this.isConnected && this.currentUserId === userId) {
      return this.ws;
    }

    try {
      this.currentChatId = chatId;
      this.currentUserId = userId;
      
      // Подключаемся для пользователя, а не конкретного чата
      // this.ws = new WebSocket(`ws://localhost:3001?userId=${userId}`);
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
      
      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Received WebSocket message:', data);
          
          // Создаем кастомное событие
          const customEvent = new CustomEvent('websocket-message', {
            detail: data
          });
          window.dispatchEvent(customEvent);
        } catch (error) {
          console.log('Error parsing message:', error);
        }
      };

      this.ws.onclose = () => {
        this.isConnected = false;
        console.log('WebSocket connection closed');
        if (this.reconnectedAttempts < this.maxReconnectedAttempts) {
          setTimeout(() => {
            this.reconnectedAttempts++;
            console.log(`Reconnecting in 5 seconds... Attempt ${this.reconnectedAttempts}/${this.maxReconnectedAttempts}`);
            this.connect(chatId, userId);
          }, this.reconnectInterval);
        }
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

  disconnect() {
    if (this.ws) {
      this.ws.onclose = null;
      this.ws.close();
      this.ws = null;
      this.isConnected = false;
      this.currentChatId = null;
      this.currentUserId = null;
    }
  }
}

export const webSocketService = new WebSocketService();