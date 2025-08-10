// Export formats for writing/document tools
export type ExportFormat = 'pdf' | 'docx' | 'txt' | 'markdown' | 'html';

// Writing editor related types
export interface WritingToolbarProps {
  onExport?: (format: ExportFormat) => void;
  onFormat?: (type: 'bold' | 'italic' | 'underline') => void;
  disabled?: boolean;
}

export interface WritingEditorProps {
  value: string;
  onChange: (value: string) => void;
  onTextSelect: () => void;
  placeholder?: string;
  disabled?: boolean;
}

// Document/writing related interfaces
export interface Document {
  id: string;
  title: string;
  content: string;
  format: ExportFormat;
  createdAt: number;
  updatedAt: number;
}

export interface WritingSession {
  documentId: string;
  startTime: number;
  endTime?: number;
  wordCount: number;
}