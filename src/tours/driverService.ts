import { driver, DriveStep } from "driver.js";
import "driver.js/dist/driver.css";

export type TourStep = {
  element?: string; // CSS selector or [data-tour="..."]
  popover: {
    title: string;
    description: string;
    position?: "left" | "right" | "top" | "bottom";
  };
};

export interface TourOptions {
  showProgress?: boolean;
  allowClose?: boolean;
  overlayOpacity?: number;
  nextBtnText?: string;
  prevBtnText?: string;
  doneBtnText?: string;
  onDestroyed?: () => void;
  onHighlightStarted?: (element: Element, step: DriveStep, options: any) => void;
  onHighlighted?: (element: Element, step: DriveStep, options: any) => void;
}

const defaultOptions: TourOptions = {
  showProgress: true,
  allowClose: true,
  overlayOpacity: 0.4,
  nextBtnText: "Next",
  prevBtnText: "Back",
  doneBtnText: "Done",
};

export function createTour(steps: TourStep[], options: TourOptions = {}) {
  const mergedOptions = { ...defaultOptions, ...options };
  
  return driver({
    showProgress: mergedOptions.showProgress,
    allowClose: mergedOptions.allowClose,
    overlayOpacity: mergedOptions.overlayOpacity,
    nextBtnText: mergedOptions.nextBtnText,
    prevBtnText: mergedOptions.prevBtnText,
    doneBtnText: mergedOptions.doneBtnText,
    onDestroyed: mergedOptions.onDestroyed,
    onHighlightStarted: mergedOptions.onHighlightStarted,
    onHighlighted: mergedOptions.onHighlighted,
    steps: steps.map(s => ({
      element: s.element,
      popover: {
        title: s.popover.title,
        description: s.popover.description,
        position: s.popover.position ?? "right",
      },
    })),
  });
}

// Utility function to check if an element exists before starting a tour
export function validateTourElements(steps: TourStep[]): boolean {
  const missingElements: string[] = [];
  
  steps.forEach((step, index) => {
    if (step.element && !document.querySelector(step.element)) {
      missingElements.push(`Step ${index + 1}: ${step.element}`);
    }
  });
  
  if (missingElements.length > 0) {
    console.warn("Tour elements not found:", missingElements);
    return false;
  }
  
  return true;
}

// Utility to wait for elements to be available
export function waitForElement(selector: string, timeout = 5000): Promise<Element> {
  return new Promise((resolve, reject) => {
    const element = document.querySelector(selector);
    if (element) {
      resolve(element);
      return;
    }
    
    const observer = new MutationObserver(() => {
      const element = document.querySelector(selector);
      if (element) {
        observer.disconnect();
        resolve(element);
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
    
    setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Element ${selector} not found within timeout`));
    }, timeout);
  });
}

// Enhanced tour creation with element waiting
export async function createTourWithValidation(steps: TourStep[], options: TourOptions = {}) {
  // Wait for critical elements to be available
  const elementsToWait = steps
    .filter(step => step.element)
    .map(step => step.element!);
  
  try {
    // Wait for the first few elements to ensure the page is ready
    if (elementsToWait.length > 0) {
      await Promise.race([
        waitForElement(elementsToWait[0]),
        new Promise(resolve => setTimeout(resolve, 2000)) // Fallback timeout
      ]);
    }
    
    return createTour(steps, options);
  } catch (error) {
    console.warn("Some tour elements may not be available:", error);
    // Create tour anyway, driver.js will skip missing elements
    return createTour(steps, options);
  }
}