
export interface User {
  id: string;
  email?: string;
}

export interface Message {
  id: string;
  chat_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
  type: 'text_message' | 'code_run' | 'screen_recording';
  coderunEvents?: string[];
}

export interface Chat {
  id: string;
  title: string;
  created_at: string;
}

export interface CoderunEvent {
  id: string;
  message_id: string;
  created_at: string;
  browserEvents: string[];
}

export interface BrowserEvent {
  id: string;
  coderun_event_id: string;
  created_at: string;
  data: any;
}

export interface DataState {
  messages: {
    [messageId: string]: Message;
  };
  coderunEvents: {
    [eventId: string]: CoderunEvent;
  };
  browserEvents: {
    [eventId: string]: BrowserEvent;
  };
}
