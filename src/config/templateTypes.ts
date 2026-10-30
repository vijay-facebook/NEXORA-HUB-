export enum TemplateStatus {
  PLANNED = 'Planned',
  IN_DEVELOPMENT = 'In Development',
  READY = 'Ready',
  PUBLISHED = 'Published'
}

export interface TemplateConfig {
  id: string;
  name: string;
  slug: string;
  status: TemplateStatus | 'Planned' | 'In Development' | 'Ready' | 'Published';
  industryType: string;
}
