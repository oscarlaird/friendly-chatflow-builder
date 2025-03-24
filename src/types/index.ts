
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
  coderunEvents: string[];
  // Additional fields from Supabase schema
  code_output?: any;
  steps?: any;
  text_is_currently_streaming?: boolean;
  from_template?: boolean;
  script?: string;
  screenrecording_url?: string;
  uid: string;
}

export interface Chat {
  id: string;
  title: string;
  created_at: string;
  uid: string;
  is_example?: boolean;
  steps?: any;
  script?: string;
}

export interface CoderunEvent {
  id: string;
  message_id: string;
  created_at: string;
  browserEvents: string[];
  // Additional fields from Supabase schema
  input?: any;
  output?: any;
  n_progress?: number;
  n_total?: number;
  requires_browser: boolean;
  uid: string;
  chat_id: string;
  function_name?: string;
  progress_title?: string;
  description?: string;
}

export interface BrowserEvent {
  id: string;
  coderun_event_id: string;
  created_at: string;
  data: any;
  // Additional fields from Supabase schema
  message_id: string;
  chat_id: string;
  uid: string;
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
