import { useState } from 'react';
import { templateRegistry } from '../../config/templateRegistry';
import { TemplateConfig, TemplateStatus } from '../../config/templateTypes';

export const useTemplateManager = () => {
  const [templates, setTemplates] = useState<TemplateConfig[]>(templateRegistry);

  /**
   * Retrieves full configuration for a specific template by its unique id or slug.
   * @param id The template id or slug (e.g. 'barber-shop')
   */
  const getTemplate = (id: string): TemplateConfig | undefined => {
    return templates.find(t => t.id === id || t.slug === id);
  };

  /**
   * Updates the lifecycle status of a specific template.
   * @param id The template id or slug
   * @param status The new status ('Planned' | 'In Development' | 'Ready' | 'Published')
   */
  const updateTemplateStatus = (
    id: string,
    status: TemplateStatus | 'Planned' | 'In Development' | 'Ready' | 'Published'
  ) => {
    const exists = templates.some(t => t.id === id || t.slug === id);
    if (!exists) {
      console.warn(`Template with id/slug "${id}" not found in templateRegistry.`);
      return;
    }

    setTemplates(prev =>
      prev.map(t => (t.id === id || t.slug === id ? { ...t, status } : t))
    );
  };

  /**
   * Returns the list of all registered templates.
   */
  const listTemplates = (): TemplateConfig[] => {
    return templates;
  };

  /**
   * Checks if a given template is ready or published for live client view.
   */
  const isTemplateReady = (id: string): boolean => {
    const template = getTemplate(id);
    return template?.status === TemplateStatus.READY || template?.status === TemplateStatus.PUBLISHED;
  };

  return {
    templates,
    getTemplate,
    updateTemplateStatus,
    listTemplates,
    getAllTemplates: listTemplates,
    isTemplateReady
  };
};

export default useTemplateManager;
