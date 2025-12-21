// Accessibility utilities for better user experience

/**
 * Generate a unique ID for form elements
 */
export const generateId = (prefix: string = 'element'): string => {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Announce content to screen readers
 */
export const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite'): void => {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

/**
 * Focus management utilities
 */
export const focusManagement = {
  /**
   * Focus the first focusable element in a container
   */
  focusFirst: (container: HTMLElement): void => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    if (firstElement) {
      firstElement.focus();
    }
  },

  /**
   * Trap focus within a container (useful for modals)
   */
  trapFocus: (container: HTMLElement): (() => void) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>;
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);

    // Return cleanup function
    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  },

  /**
   * Save and restore focus
   */
  saveFocus: (): (() => void) => {
    const activeElement = document.activeElement as HTMLElement;
    return () => {
      if (activeElement && activeElement.focus) {
        activeElement.focus();
      }
    };
  }
};

/**
 * Keyboard navigation utilities
 */
export const keyboardNavigation = {
  /**
   * Handle arrow key navigation in lists
   */
  handleArrowKeys: (
    event: KeyboardEvent,
    items: HTMLElement[],
    currentIndex: number,
    onIndexChange: (index: number) => void
  ): void => {
    let newIndex = currentIndex;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        newIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
        break;
      case 'ArrowUp':
        event.preventDefault();
        newIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
        break;
      case 'Home':
        event.preventDefault();
        newIndex = 0;
        break;
      case 'End':
        event.preventDefault();
        newIndex = items.length - 1;
        break;
      default:
        return;
    }

    onIndexChange(newIndex);
    items[newIndex]?.focus();
  },

  /**
   * Handle escape key
   */
  handleEscape: (event: KeyboardEvent, callback: () => void): void => {
    if (event.key === 'Escape') {
      event.preventDefault();
      callback();
    }
  }
};

/**
 * ARIA utilities
 */
export const aria = {
  /**
   * Set ARIA attributes for expanded/collapsed states
   */
  setExpanded: (element: HTMLElement, expanded: boolean): void => {
    element.setAttribute('aria-expanded', expanded.toString());
  },

  /**
   * Set ARIA attributes for selected states
   */
  setSelected: (element: HTMLElement, selected: boolean): void => {
    element.setAttribute('aria-selected', selected.toString());
  },

  /**
   * Set ARIA attributes for pressed states (buttons)
   */
  setPressed: (element: HTMLElement, pressed: boolean): void => {
    element.setAttribute('aria-pressed', pressed.toString());
  },

  /**
   * Set ARIA live region
   */
  setLiveRegion: (element: HTMLElement, priority: 'polite' | 'assertive' = 'polite'): void => {
    element.setAttribute('aria-live', priority);
    element.setAttribute('aria-atomic', 'true');
  }
};

/**
 * Color contrast utilities
 */
export const colorContrast = {
  /**
   * Check if user prefers reduced motion
   */
  prefersReducedMotion: (): boolean => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },

  /**
   * Check if user prefers high contrast
   */
  prefersHighContrast: (): boolean => {
    return window.matchMedia('(prefers-contrast: high)').matches;
  },

  /**
   * Check if user prefers dark mode
   */
  prefersDarkMode: (): boolean => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
};

/**
 * Form accessibility utilities
 */
export const formAccessibility = {
  /**
   * Associate label with input
   */
  associateLabel: (input: HTMLElement, label: HTMLElement): void => {
    const inputId = input.id || generateId('input');
    input.id = inputId;
    label.setAttribute('for', inputId);
  },

  /**
   * Set error state for form field
   */
  setFieldError: (field: HTMLElement, errorMessage: string, errorId?: string): void => {
    const errorElementId = errorId || generateId('error');
    field.setAttribute('aria-invalid', 'true');
    field.setAttribute('aria-describedby', errorElementId);
    
    // Create or update error element
    let errorElement = document.getElementById(errorElementId);
    if (!errorElement) {
      errorElement = document.createElement('div');
      errorElement.id = errorElementId;
      errorElement.className = 'error-message';
      field.parentNode?.appendChild(errorElement);
    }
    errorElement.textContent = errorMessage;
    errorElement.setAttribute('role', 'alert');
  },

  /**
   * Clear error state for form field
   */
  clearFieldError: (field: HTMLElement, errorId?: string): void => {
    field.removeAttribute('aria-invalid');
    field.removeAttribute('aria-describedby');
    
    if (errorId) {
      const errorElement = document.getElementById(errorId);
      if (errorElement) {
        errorElement.remove();
      }
    }
  }
};

/**
 * Skip link utilities
 */
export const skipLinks = {
  /**
   * Create skip link for main content
   */
  createSkipLink: (targetId: string, text: string = 'Skip to main content'): HTMLElement => {
    const skipLink = document.createElement('a');
    skipLink.href = `#${targetId}`;
    skipLink.textContent = text;
    skipLink.className = 'skip-link sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-md z-50';
    
    return skipLink;
  }
};

/**
 * Screen reader utilities
 */
export const screenReader = {
  /**
   * Hide element from screen readers
   */
  hide: (element: HTMLElement): void => {
    element.setAttribute('aria-hidden', 'true');
  },

  /**
   * Show element to screen readers
   */
  show: (element: HTMLElement): void => {
    element.removeAttribute('aria-hidden');
  },

  /**
   * Make element visible only to screen readers
   */
  onlyVisible: (element: HTMLElement): void => {
    element.className += ' sr-only';
  }
};