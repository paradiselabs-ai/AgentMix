/**
 * AgentMix Compact Modal Design System Constants
 * 
 * This file documents the standardized spacing, typography, and component patterns
 * applied throughout the application to maintain visual consistency and efficient
 * use of screen space in modal dialogs and compact layouts.
 * 
 * Reference: Compact Modal Design Guide
 */

// ============================================================================
// SPACING STANDARDS (Tailwind Classes)
// ============================================================================

export const SPACING = {
  // Padding for different contexts
  padding: {
    modalContent: 'p-4',      // Main modal content area
    card: 'p-3',              // Cards within modals
    section: 'p-3',           // Section containers
    input: 'h-8 text-xs',     // Input fields in forms
  },

  // Gaps between elements
  gaps: {
    large: 'gap-4',      // Between major sections
    medium: 'gap-3',     // Between items in groups
    small: 'gap-2',      // Between elements
    tight: 'gap-1.5',    // Compact spacing
  },

  // Margins for spacing
  margins: {
    sectionBreak: 'mb-4 mt-4',
    itemBreak: 'mb-3 mt-3',
    tightBreak: 'mb-2 mt-2',
  },

  // Specific space-y classes
  verticalSpacing: {
    relaxed: 'space-y-4',    // Generous vertical spacing
    normal: 'space-y-3',     // Standard vertical spacing
    compact: 'space-y-2',    // Tight vertical spacing
  },
}

// ============================================================================
// TYPOGRAPHY STANDARDS
// ============================================================================

export const TYPOGRAPHY = {
  // Size mappings (Tailwind classes)
  sizes: {
    title: 'text-base font-semibold',           // Modal/dialog titles
    subtitle: 'text-sm font-medium',            // Section headers
    body: 'text-xs',                            // Body text, labels
    caption: 'text-[10px]',                     // Small text, hints
    description: 'text-xs',                     // Descriptions
  },

  // Color mappings
  colors: {
    primary: 'text-gray-900',                   // Primary text
    secondary: 'text-gray-700',                 // Secondary text
    muted: 'text-gray-600',                     // Muted text
  },

  // Specific classes for common use cases
  classes: {
    modalTitle: 'text-base font-semibold text-gray-900',
    modalDescription: 'text-xs text-gray-600',
    formLabel: 'text-xs font-medium text-gray-700',
    badge: 'text-[10px] font-medium px-2 py-0.5',
    buttonText: 'text-xs font-medium',
  },
}

// ============================================================================
// BUTTON STYLING STANDARDS
// ============================================================================

export const BUTTONS = {
  // Standard button sizes for modals
  sizes: {
    default: 'h-8 px-3 text-xs',       // Default modal buttons
    icon: 'h-7 w-7 p-0',               // Icon-only buttons
    footer: 'h-8 px-4 text-xs',        // Footer action buttons
    inline: 'h-6 px-2 text-[10px]',    // Inline action buttons
    compact: 'h-8 px-3 text-xs',       // Compact action buttons
  },

  // Common button configurations
  configurations: {
    modal: 'h-8 px-3 text-xs',
    form: 'h-8 px-4 text-xs',
    icon: 'h-7 w-7 p-0',
    danger: 'h-8 px-3 text-xs bg-red-100 text-red-800 border border-red-200',
    success: 'h-8 px-3 text-xs bg-green-100 text-green-800 border border-green-200',
  },
}

// ============================================================================
// ICON SIZING STANDARDS
// ============================================================================

export const ICONS = {
  sizes: {
    inline: 'h-3 w-3',        // Inline with text
    standard: 'h-4 w-4',      // Standard/default icons
    large: 'h-5 w-5',         // Larger icons (headers, stats)
    feature: 'h-6 w-6',       // Feature icons (cards)
    xlarge: 'h-8 w-8',        // Extra large (avatar-like)
  },

  // Common icon use cases
  usage: {
    buttonIcon: 'h-3 w-3 mr-1',          // Icon in button with text
    headerIcon: 'h-4 w-4 mr-2',          // Icon in header
    statIcon: 'h-5 w-5',                 // Stat card icon
    listIcon: 'h-4 w-4 mr-1.5',          // Icon in list item
    badgeIcon: 'h-3 w-3 mr-1',           // Icon in badge
  },
}

// ============================================================================
// MODAL/DIALOG PATTERNS
// ============================================================================

export const MODAL_PATTERNS = {
  // Modal width/size configurations
  sizes: {
    small: 'max-w-sm',           // 384px - Confirmations, simple forms
    medium: 'max-w-md',          // 448px - Standard forms, details
    large: 'max-w-lg',           // 512px - Complex forms
    xlarge: 'max-w-xl',          // 576px - Rich content
    xxlarge: 'max-w-2xl',        // 672px - Data tables, lists
    full: 'max-w-4xl',           // 896px - Full-featured views
    wide: 'max-w-7xl',           // 1280px - Comprehensive views
  },

  // Modal height constraints
  heights: {
    auto: '',                     // Content-based (default)
    compact: 'max-h-[60vh]',     // Quick views
    standard: 'max-h-[75vh]',    // Most modals
    tall: 'max-h-[85vh]',        // Data-heavy modals
    fullHeight: 'max-h-[95vh]',  // Maximum utilization
  },

  // Standard header configuration
  header: {
    padding: 'pb-3',
    titleSize: 'text-base font-semibold text-gray-900',
    descriptionSize: 'text-xs text-gray-600',
  },

  // Standard footer configuration
  footer: {
    padding: 'pt-3 border-t border-gray-200',
    gap: 'gap-2',
  },

  // Content spacing
  content: {
    spacing: 'space-y-3',
    padding: 'px-4 py-3',
  },
}

// ============================================================================
// BADGE STYLING STANDARDS
// ============================================================================

export const BADGES = {
  variants: {
    default: 'px-2 py-0.5 text-[10px] font-medium bg-gray-100 text-gray-800 border border-gray-200 rounded',
    success: 'px-2 py-0.5 text-[10px] font-medium bg-green-100 text-green-800 border border-green-200 rounded',
    warning: 'px-2 py-0.5 text-[10px] font-medium bg-yellow-100 text-yellow-800 border border-yellow-200 rounded',
    error: 'px-2 py-0.5 text-[10px] font-medium bg-red-100 text-red-800 border border-red-200 rounded',
    info: 'px-2 py-0.5 text-[10px] font-medium bg-blue-100 text-blue-800 border border-blue-200 rounded',
  },
}

// ============================================================================
// CARD STYLING STANDARDS
// ============================================================================

export const CARDS = {
  // Standard card padding
  padding: {
    default: 'p-4',       // Default card padding
    compact: 'p-3',       // Compact card padding
    spacious: 'p-5',      // More spacious card padding
  },

  // Card borders
  borders: {
    subtle: 'border border-gray-200',
    glass: 'border border-white/30',
  },

  // Card backgrounds
  backgrounds: {
    light: 'bg-gray-50',
    white: 'bg-white',
    glass: 'bg-white/90 backdrop-blur-md',
  },
}

// ============================================================================
// FORM ELEMENTS STANDARDS
// ============================================================================

export const FORM_ELEMENTS = {
  // Input field styling
  input: {
    height: 'h-8',
    padding: 'px-3 py-2',
    textSize: 'text-xs',
    border: 'border border-gray-300',
    borderFocus: 'focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500',
  },

  // Label styling
  label: {
    size: 'text-xs font-medium text-gray-700',
    spacing: 'mb-1.5',
  },

  // Field group spacing
  fieldGroup: {
    spacing: 'space-y-1.5',
    gap: 'gap-1.5',
  },
}

// ============================================================================
// COLOR PALETTE (Compact Design)
// ============================================================================

export const COLORS = {
  // Background colors for sections
  backgrounds: {
    section: 'bg-gray-50',           // Section backgrounds
    hover: 'hover:bg-gray-50',       // Hover state
    active: 'bg-blue-50',            // Active state
  },

  // Border colors
  borders: {
    default: 'border-gray-200',      // Default border
    light: 'border-gray-100',        // Light border
    hover: 'border-gray-300',        // Hover border
  },

  // Text colors
  text: {
    primary: 'text-gray-900',        // Primary text
    secondary: 'text-gray-700',      // Secondary text
    muted: 'text-gray-600',          // Muted text
    disabled: 'text-gray-400',       // Disabled text
  },
}

// ============================================================================
// RESPONSIVE PATTERNS
// ============================================================================

export const RESPONSIVE = {
  // Mobile-first breakpoints
  breakpoints: {
    mobile: 'max-w-[95vw] sm:max-w-md',
    tablet: 'max-w-[90vw] sm:max-w-2xl',
    desktop: 'max-w-[85vw] sm:max-w-4xl',
  },

  // Responsive spacing
  spacing: {
    mobileContent: 'px-3 py-2 sm:px-4 sm:py-3',
    mobileGap: 'gap-2 sm:gap-3',
    mobilePadding: 'p-3 sm:p-4',
  },
}

// ============================================================================
// ANIMATION/TRANSITION STANDARDS
// ============================================================================

export const ANIMATIONS = {
  // Standard transitions
  transitions: {
    fast: 'transition-all duration-150',
    normal: 'transition-all duration-200',
    slow: 'transition-all duration-300',
  },

  // Loading states
  loading: {
    spinner: 'animate-spin',
    pulse: 'animate-pulse',
  },
}

// ============================================================================
// MIGRATION HELPERS
// ============================================================================

/**
 * Utility function to help migrate old spacing to new compact standards
 * Usage: Can be referenced in code refactoring guidelines
 */
export const SPACING_MIGRATION = {
  // Padding migrations
  padding: {
    'p-6': 'p-4',
    'p-5': 'p-4',
    'p-4': 'p-3',
    'px-6': 'px-4',
    'py-6': 'py-4',
    'px-4': 'px-3',
    'py-4': 'py-3',
  },

  // Gap migrations
  gaps: {
    'gap-6': 'gap-4',
    'gap-5': 'gap-3',
    'gap-4': 'gap-3',
    'space-y-6': 'space-y-4',
    'space-y-5': 'space-y-3',
    'space-y-4': 'space-y-3',
    'space-x-4': 'space-x-3',
    'space-x-3': 'space-x-2',
  },

  // Margin migrations
  margins: {
    'mb-6': 'mb-4',
    'mb-4': 'mb-3',
    'mt-4': 'mt-3',
    'my-4': 'my-3',
  },

  // Typography migrations
  typography: {
    'text-lg': 'text-base',
    'text-sm': 'text-xs',
    'text-xs': 'text-[10px]',
  },
}

/**
 * Export all constants as a single object for convenience
 */
export const COMPACT_DESIGN_SYSTEM = {
  SPACING,
  TYPOGRAPHY,
  BUTTONS,
  ICONS,
  MODAL_PATTERNS,
  BADGES,
  CARDS,
  FORM_ELEMENTS,
  COLORS,
  RESPONSIVE,
  ANIMATIONS,
  SPACING_MIGRATION,
}

export default COMPACT_DESIGN_SYSTEM
