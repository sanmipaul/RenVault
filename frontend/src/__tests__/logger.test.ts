import { Logger, LogLevel, ConsoleTransport, BufferTransport, FilterTransport, LogEntry } from '../utils/logger';

const silentOptions = { transports: [] };

describe('LogLevel ordering', () => {
  it('DEBUG < INFO < WARN < ERROR < SILENT', () => {
    expect(LogLevel.DEBUG).toBeLessThan(LogLevel.INFO);
    expect(LogLevel.INFO).toBeLessThan(LogLevel.WARN);
    expect(LogLevel.WARN).toBeLessThan(LogLevel.ERROR);
    expect(LogLevel.ERROR).toBeLessThan(LogLevel.SILENT);
  });
});

describe('Logger - minLevel filtering', () => {
  it('does not log DEBUG when minLevel is INFO', () => {
    const buf = new BufferTransport();
    const log = new Logger({ minLevel: LogLevel.INFO, transports: [buf] });
    log.debug('should be filtered');
    expect(buf.getEntries()).toHaveLength(0);
  });

  it('logs INFO when minLevel is INFO', () => {
    const buf = new BufferTransport();
    const log = new Logger({ minLevel: LogLevel.INFO, transports: [buf] });
    log.info('hello');
    expect(buf.getEntries()).toHaveLength(1);
  });

  it('logs WARN when minLevel is INFO', () => {
    const buf = new BufferTransport();
    const log = new Logger({ minLevel: LogLevel.INFO, transports: [buf] });
    log.warn('warning');
    expect(buf.getEntries()).toHaveLength(1);
  });

  it('logs ERROR when minLevel is WARN', () => {
    const buf = new BufferTransport();
    const log = new Logger({ minLevel: LogLevel.WARN, transports: [buf] });
    log.error('error');
    expect(buf.getEntries()).toHaveLength(1);
  });

  it('logs nothing when minLevel is SILENT', () => {
    const buf = new BufferTransport();
    const log = new Logger({ minLevel: LogLevel.SILENT, transports: [buf] });
    log.debug('d'); log.info('i'); log.warn('w'); log.error('e');
    expect(buf.getEntries()).toHaveLength(0);
  });

  it('silence() sets minLevel to SILENT', () => {
    const buf = new BufferTransport();
    const log = new Logger({ minLevel: LogLevel.DEBUG, transports: [buf] });
    log.silence();
    log.error('should not appear');
    expect(buf.getEntries()).toHaveLength(0);
  });
});

describe('Logger - setMinLevel', () => {
  it('dynamically changes the minimum log level', () => {
    const buf = new BufferTransport();
    const log = new Logger({ minLevel: LogLevel.ERROR, transports: [buf] });
    log.info('filtered');
    expect(buf.getEntries()).toHaveLength(0);
    log.setMinLevel(LogLevel.INFO);
    log.info('now visible');
    expect(buf.getEntries()).toHaveLength(1);
  });
});

describe('Logger - structured entries', () => {
  it('entry has correct level, levelName, message, and timestamp', () => {
    const buf = new BufferTransport();
    const log = new Logger({ minLevel: LogLevel.DEBUG, transports: [buf] });
    log.warn('test warning');
    const entry = buf.getEntries()[0];
    expect(entry.level).toBe(LogLevel.WARN);
    expect(entry.levelName).toBe('WARN');
    expect(entry.message).toBe('test warning');
    expect(entry.timestamp).toBeTruthy();
  });

  it('entry includes data when provided', () => {
    const buf = new BufferTransport();
    const log = new Logger({ minLevel: LogLevel.DEBUG, transports: [buf] });
    log.info('with data', { key: 'value' });
    expect(buf.getEntries()[0].data).toEqual({ key: 'value' });
  });

  it('entry includes error when provided', () => {
    const buf = new BufferTransport();
    const log = new Logger({ minLevel: LogLevel.DEBUG, transports: [buf] });
    const err = new Error('oops');
    log.error('failed', err);
    expect(buf.getEntries()[0].error).toBe(err);
  });
});

describe('Logger - context', () => {
  it('entry includes context when set', () => {
    const buf = new BufferTransport();
    const log = new Logger({ minLevel: LogLevel.DEBUG, context: 'WalletService', transports: [buf] });
    log.info('connected');
    expect(buf.getEntries()[0].context).toBe('WalletService');
  });
});

describe('Logger - child loggers', () => {
  it('child logger inherits minLevel', () => {
    const buf = new BufferTransport();
    const parent = new Logger({ minLevel: LogLevel.WARN, transports: [buf] });
    const child = parent.child('SubService');
    child.info('filtered by parent level');
    expect(buf.getEntries()).toHaveLength(0);
  });

  it('child logger context is namespaced', () => {
    const buf = new BufferTransport();
    const parent = new Logger({ minLevel: LogLevel.DEBUG, context: 'App', transports: [buf] });
    const child = parent.child('Wallet');
    child.info('msg');
    expect(buf.getEntries()[0].context).toBe('App:Wallet');
  });

  it('child without parent context uses own context', () => {
    const buf = new BufferTransport();
    const parent = new Logger({ minLevel: LogLevel.DEBUG, transports: [buf] });
    const child = parent.child('Wallet');
    child.info('msg');
    expect(buf.getEntries()[0].context).toBe('Wallet');
  });
});

describe('Logger - buffer', () => {
  it('getBuffer returns all logged entries', () => {
    const log = new Logger({ minLevel: LogLevel.DEBUG, ...silentOptions });
    log.info('a'); log.warn('b'); log.error('c');
    expect(log.getBuffer()).toHaveLength(3);
  });

  it('clearBuffer empties the buffer', () => {
    const log = new Logger({ minLevel: LogLevel.DEBUG, ...silentOptions });
    log.info('a');
    log.clearBuffer();
    expect(log.getBuffer()).toHaveLength(0);
  });

  it('buffer respects bufferSize cap', () => {
    const log = new Logger({ minLevel: LogLevel.DEBUG, bufferSize: 3, ...silentOptions });
    log.info('a'); log.info('b'); log.info('c'); log.info('d');
    expect(log.getBuffer()).toHaveLength(3);
    expect(log.getBuffer()[0].message).toBe('b');
  });

  it('getRecentErrors returns only ERROR entries', () => {
    const log = new Logger({ minLevel: LogLevel.DEBUG, ...silentOptions });
    log.info('info'); log.error('err1'); log.error('err2');
    expect(log.getRecentErrors()).toHaveLength(2);
  });

  it('getRecentWarnings returns only WARN entries', () => {
    const log = new Logger({ minLevel: LogLevel.DEBUG, ...silentOptions });
    log.warn('w1'); log.info('i'); log.warn('w2');
    expect(log.getRecentWarnings()).toHaveLength(2);
  });
});

describe('Logger - exportLogs', () => {
  it('returns valid JSON string', () => {
    const log = new Logger({ minLevel: LogLevel.DEBUG, ...silentOptions });
    log.info('test');
    const exported = log.exportLogs();
    expect(() => JSON.parse(exported)).not.toThrow();
  });
});

describe('Logger - getLogStats', () => {
  it('counts entries by level', () => {
    const log = new Logger({ minLevel: LogLevel.DEBUG, ...silentOptions });
    log.debug('d'); log.info('i'); log.info('i2'); log.warn('w'); log.error('e');
    const stats = log.getLogStats();
    expect(stats.DEBUG).toBe(1);
    expect(stats.INFO).toBe(2);
    expect(stats.WARN).toBe(1);
    expect(stats.ERROR).toBe(1);
  });
});

describe('Logger - getErrorRate', () => {
  it('returns 0 for empty buffer', () => {
    const log = new Logger({ minLevel: LogLevel.DEBUG, ...silentOptions });
    expect(log.getErrorRate()).toBe(0);
  });

  it('returns correct ratio', () => {
    const log = new Logger({ minLevel: LogLevel.DEBUG, ...silentOptions });
    log.info('a'); log.info('b'); log.error('e');
    expect(log.getErrorRate()).toBeCloseTo(1 / 3);
  });
});

describe('BufferTransport', () => {
  it('stores entries up to maxSize', () => {
    const buf = new BufferTransport(2);
    const log = new Logger({ minLevel: LogLevel.DEBUG, transports: [buf] });
    log.info('a'); log.info('b'); log.info('c');
    expect(buf.getEntries()).toHaveLength(2);
  });

  it('getEntriesByLevel filters correctly', () => {
    const buf = new BufferTransport();
    const log = new Logger({ minLevel: LogLevel.DEBUG, transports: [buf] });
    log.info('i'); log.warn('w'); log.error('e');
    expect(buf.getEntriesByLevel(LogLevel.WARN)).toHaveLength(1);
  });

  it('clear empties entries', () => {
    const buf = new BufferTransport();
    const log = new Logger({ minLevel: LogLevel.DEBUG, transports: [buf] });
    log.info('a');
    buf.clear();
    expect(buf.getEntries()).toHaveLength(0);
  });

  it('export returns valid JSON', () => {
    const buf = new BufferTransport();
    const log = new Logger({ minLevel: LogLevel.DEBUG, transports: [buf] });
    log.info('test');
    expect(() => JSON.parse(buf.export())).not.toThrow();
  });
});

describe('FilterTransport', () => {
  it('only passes entries at or above minLevel', () => {
    const buf = new BufferTransport();
    const filter = new FilterTransport(buf, LogLevel.ERROR);
    const log = new Logger({ minLevel: LogLevel.DEBUG, transports: [filter] });
    log.debug('d'); log.info('i'); log.warn('w'); log.error('e');
    expect(buf.getEntries()).toHaveLength(1);
    expect(buf.getEntries()[0].level).toBe(LogLevel.ERROR);
  });
});
