// utils/sessionExport.ts
import { SessionMonitor } from '../services/session/SessionMonitor';

export interface ExportOptions {
  format: 'json' | 'csv';
  includeEvents: boolean;
  includeMetrics: boolean;
  includeHealthReport: boolean;
  dateRange?: {
    start: number;
    end: number;
  };
  anonymize: boolean;
}

export interface ExportResult {
  data: string;
  filename: string;
  mimeType: string;
}

/**
 * Export session data in various formats
 */
export const exportSessionData = (options: ExportOptions): ExportResult => {
  const monitor = SessionMonitor.getInstance();
  const exportData = monitor.exportSessionData();

  let data: string;
  let filename: string;
  let mimeType: string;

  // Filter by date range if specified
  if (options.dateRange) {
    exportData.events = exportData.events.filter(
      event => event.timestamp >= options.dateRange!.start &&
               event.timestamp <= options.dateRange!.end
    );
  }

  // Anonymize data if requested
  if (options.anonymize) {
    exportData.events = exportData.events.map(event => ({
      ...event,
      sessionId: hashString(event.sessionId || ''),
      metadata: event.metadata ? { ...event.metadata, address: 'anonymized' } : undefined
    }));
  }

  switch (options.format) {
    case 'json':
      const jsonData: any = {};

      if (options.includeMetrics) {
        jsonData.metrics = exportData.metrics;
      }

      if (options.includeHealthReport) {
        jsonData.healthReport = exportData.healthReport;
      }

      if (options.includeEvents) {
        jsonData.events = exportData.events;
      }

      jsonData.exportTime = exportData.exportTime;
      jsonData.exportOptions = options;

      data = JSON.stringify(jsonData, null, 2);
      filename = `session-data-${new Date().toISOString().split('T')[0]}.json`;
      mimeType = 'application/json';
      break;

    case 'csv':
      data = generateCSV(exportData, options);
      filename = `session-data-${new Date().toISOString().split('T')[0]}.csv`;
      mimeType = 'text/csv';
      break;

    default:
      throw new Error(`Unsupported export format: ${options.format}`);
  }

  return {
    data,
    filename,
    mimeType
  };
};

/**
 * Generate CSV format from session data
 */
const generateCSV = (exportData: any, options: ExportOptions): string => {
  const lines: string[] = [];

  // Add header
  lines.push('Session Data Export');
  lines.push(`Export Date,${new Date().toISOString()}`);
  lines.push(`Format,${options.format}`);
  lines.push('');

  // Add metrics
  if (options.includeMetrics) {
    lines.push('Session Metrics');
    lines.push('Metric,Value');
    Object.entries(exportData.metrics).forEach(([key, value]) => {
      lines.push(`${key},${value}`);
    });
    lines.push('');
  }

  // Add health report
  if (options.includeHealthReport) {
    lines.push('Health Report');
    lines.push(`Status,${exportData.healthReport.status}`);
    lines.push('Issues,');
    exportData.healthReport.issues.forEach((issue: string) => {
      lines.push(`,${escapeCSV(issue)}`);
    });
    lines.push('Recommendations,');
    exportData.healthReport.recommendations.forEach((rec: string) => {
      lines.push(`,${escapeCSV(rec)}`);
    });
    lines.push('');
  }

  // Add events
  if (options.includeEvents) {
    lines.push('Session Events');
    lines.push('Timestamp,Type,Session ID,Provider Type,Metadata');

    exportData.events.forEach((event: any) => {
      const timestamp = new Date(event.timestamp).toISOString();
      const metadata = event.metadata ? JSON.stringify(event.metadata) : '';
      lines.push(`${timestamp},${event.type},${event.sessionId || ''},${event.providerType || ''},${escapeCSV(metadata)}`);
    });
  }

  return lines.join('\n');
};

/**
 * Escape CSV values that contain commas or quotes
 */
const escapeCSV = (value: string): string => {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
};

/**
 * Simple string hashing for anonymization
 */
const hashString = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36).substring(0, 8);
};

/**
 * Download exported data as a file
 */
export const downloadExport = (exportResult: ExportResult): void => {
  const blob = new Blob([exportResult.data], { type: exportResult.mimeType });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = exportResult.filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};

/**
 * Generate export summary for preview
 */
export const generateExportSummary = (options: ExportOptions): {
  estimatedSize: string;
  recordCount: number;
  dateRange: string;
} => {
  const monitor = SessionMonitor.getInstance();
  const exportData = monitor.exportSessionData();

  let recordCount = 0;

  if (options.includeEvents) {
    if (options.dateRange) {
      recordCount = exportData.events.filter(
        event => event.timestamp >= options.dateRange!.start &&
                 event.timestamp <= options.dateRange!.end
      ).length;
    } else {
      recordCount = exportData.events.length;
    }
  }

  // Rough size estimation
  let estimatedSize = 0;
  if (options.includeEvents) estimatedSize += recordCount * 200; // ~200 bytes per event
  if (options.includeMetrics) estimatedSize += 500; // ~500 bytes for metrics
  if (options.includeHealthReport) estimatedSize += 1000; // ~1KB for health report

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const dateRange = options.dateRange
    ? `${new Date(options.dateRange.start).toLocaleDateString()} - ${new Date(options.dateRange.end).toLocaleDateString()}`
    : 'All time';

  return {
    estimatedSize: formatSize(estimatedSize),
    recordCount,
    dateRange
  };
};