import React from "react";

import type { ComponentType, LazyExoticComponent } from "react";

export type Preloadable<T extends ComponentType<any>> =
  LazyExoticComponent<T> & { preload: () => Promise<any> };

export function lazyWithPreload<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
): Preloadable<T> {
  const Component = React.lazy(factory);
  // Attach preload in a type-safe way
  (Component as unknown as { preload: () => Promise<any> }).preload = factory;
  return Component as Preloadable<T>;
}
