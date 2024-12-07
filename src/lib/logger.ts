import { supabase } from './supabase';

interface LogEntry {
  level: 'info' | 'error' | 'warn';
  message: string;
  context?: Record<string, any>;
  timestamp: string;
  userId?: string;
}

export async function log(
  level: LogEntry['level'],
  message: string,
  context?: Record<string, any>,
  userId?: string
): Promise<void> {
  const entry: LogEntry = {
    level,
    message,
    context,
    timestamp: new Date().toISOString(),
    userId
  };

  // Log to console for development
  console.log(`[${entry.level.toUpperCase()}] ${entry.message}`, entry.context || '');

  try {
    const { error } = await supabase
      .from('logs')
      .insert({
        level: entry.level,
        message: entry.message,
        context: entry.context,
        user_id: entry.userId
      });

    if (error) {
      console.error('Failed to save log:', error);
    }
  } catch (error) {
    console.error('Error saving log:', error);
  }
}

export const logger = {
  info: (message: string, context?: Record<string, any>, userId?: string) => 
    log('info', message, context, userId),
  
  error: (message: string, context?: Record<string, any>, userId?: string) => 
    log('error', message, context, userId),
  
  warn: (message: string, context?: Record<string, any>, userId?: string) => 
    log('warn', message, context, userId)
};