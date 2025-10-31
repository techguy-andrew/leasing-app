/**
 * Design Tokens - TypeScript Export
 *
 * Exports design token values for use in TypeScript/JavaScript.
 * Values mirror tokens.css for consistency.
 */

export const statusColors = {
  'New': '#3B82F6',
  'Pending': '#EAB308',
  'Approved': '#10B981',
  'Rejected': '#EF4444',
  'Outstanding Tasks': '#F59E0B',
  'Ready for Move-In': '#14B8A6',
  'Archived': '#64748B'
} as const;

export const colorPalette = [
  { hex: '#3B82F6', name: 'Blue' },
  { hex: '#10B981', name: 'Emerald' },
  { hex: '#EAB308', name: 'Yellow' },
  { hex: '#EF4444', name: 'Red' },
  { hex: '#A855F7', name: 'Purple' },
  { hex: '#EC4899', name: 'Pink' },
  { hex: '#F59E0B', name: 'Orange' },
  { hex: '#14B8A6', name: 'Teal' },
  { hex: '#6366F1', name: 'Indigo' },
  { hex: '#06B6D4', name: 'Cyan' },
  { hex: '#84CC16', name: 'Lime' },
  { hex: '#F59E0B', name: 'Amber' },
  { hex: '#F43F5E', name: 'Rose' },
  { hex: '#8B5CF6', name: 'Violet' },
  { hex: '#D946EF', name: 'Fuchsia' },
  { hex: '#0EA5E9', name: 'Sky' },
  { hex: '#64748B', name: 'Gray' }
] as const;

export const uiColors = {
  success: '#10B981',
  warning: '#EAB308',
  error: '#EF4444',
  info: '#3B82F6'
} as const;

export type StatusColor = keyof typeof statusColors;
export type ColorPaletteItem = typeof colorPalette[number];
