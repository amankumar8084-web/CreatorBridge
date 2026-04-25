import { Buffer } from 'buffer';
import EventEmitter from 'events';
import * as util from 'util';

if (typeof window !== 'undefined') {
  // Use globalThis if available, otherwise window
  const globalObject = typeof globalThis !== 'undefined' ? globalThis : window;
  
  if (!globalObject.Buffer) {
    globalObject.Buffer = Buffer;
  }
  
  if (!globalObject.process) {
    globalObject.process = { 
      env: { NODE_ENV: 'development' },
      version: '',
      nextTick: (cb) => setTimeout(cb, 0),
      browser: true
    };
  }

  globalObject.EventEmitter = EventEmitter;
  
  if (!globalObject.events) {
    globalObject.events = { EventEmitter };
  }
  
  if (!globalObject.util) {
    globalObject.util = util;
  }
}
