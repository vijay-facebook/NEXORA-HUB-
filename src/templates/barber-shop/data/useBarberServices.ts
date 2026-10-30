import { useState, useEffect } from 'react';
import { BarberService, defaultBarberServices, ServiceCategory } from './services';

const STORAGE_KEY = 'the_gents_den_services_catalog_v1';

export function useBarberServices() {
  const [services, setServices] = useState<BarberService[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to read services from localStorage:', e);
    }
    return defaultBarberServices;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(services));
    } catch (e) {
      console.warn('Failed to save services to localStorage:', e);
    }
  }, [services]);

  // Admin Actions
  const addService = (newService: Omit<BarberService, 'id' | 'order'>) => {
    const id = `srv-custom-${Date.now()}`;
    const maxOrder = services.reduce((max, s) => Math.max(max, s.order || 0), 0);
    const serviceWithMeta: BarberService = {
      ...newService,
      id,
      order: maxOrder + 1
    };
    setServices(prev => [...prev, serviceWithMeta]);
    return serviceWithMeta;
  };

  const updateService = (id: string, updates: Partial<BarberService>) => {
    setServices(prev =>
      prev.map(s => (s.id === id ? { ...s, ...updates } : s))
    );
  };

  const toggleHideService = (id: string) => {
    setServices(prev =>
      prev.map(s => {
        if (s.id === id) {
          const newStatus = s.status === 'hidden' ? 'available' : 'hidden';
          return { ...s, status: newStatus };
        }
        return s;
      })
    );
  };

  const deleteService = (id: string) => {
    setServices(prev => prev.filter(s => s.id !== id));
  };

  const reorderService = (id: string, direction: 'up' | 'down') => {
    setServices(prev => {
      const index = prev.findIndex(s => s.id === id);
      if (index === -1) return prev;
      if (direction === 'up' && index === 0) return prev;
      if (direction === 'down' && index === prev.length - 1) return prev;

      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;

      // Re-assign sequential order
      return copy.map((item, idx) => ({ ...item, order: idx + 1 }));
    });
  };

  const resetToDefaults = () => {
    setServices(defaultBarberServices);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      // ignore
    }
  };

  return {
    services,
    addService,
    updateService,
    toggleHideService,
    deleteService,
    reorderService,
    resetToDefaults
  };
}
