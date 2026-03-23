export interface Content {
  contentId?: number;
  moduleId: number;
  contentType: 'Video' | 'PDF' | 'Slide' | 'Lab';
  title: string;
  contentUri: string;
  duration: number;
  status: 'Draft' | 'Published';
}