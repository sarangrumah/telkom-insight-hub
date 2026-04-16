/**
 * Map colors utility for converting CSS variables to actual HSL values
 * Mapbox GL JS cannot parse CSS custom properties at runtime
 */

// Chart colors from index.css
const CHART_COLORS = {
  light: {
    'chart-1': '221.2 83.2% 53.3%',
    'chart-2': '142.1 70.6% 45.3%', 
    'chart-3': '262.1 83.3% 57.8%',
    'chart-4': '47.9 95.8% 53.1%',
    'chart-5': '12.4 95% 64.1%',
    'primary': '221.2 83.2% 53.3%',
    'secondary': '142.1 70.6% 45.3%'
  },
  dark: {
    'chart-1': '221.2 83.2% 63.3%',
    'chart-2': '142.1 70.6% 45.3%',
    'chart-3': '262.1 83.3% 67.8%', 
    'chart-4': '47.9 95.8% 63.1%',
    'chart-5': '12.4 95% 74.1%',
    'primary': '221.2 83.2% 63.3%',
    'secondary': '142.1 70.6% 45.3%'
  }
};

/**
 * Get actual HSL color string for Mapbox
 */
export function getMapboxColor(colorKey: string, isDark = false): string {
  const theme = isDark ? 'dark' : 'light';
  const colorValue = CHART_COLORS[theme][colorKey as keyof typeof CHART_COLORS[typeof theme]];
  
  if (!colorValue) {
    console.warn(`Color ${colorKey} not found, using primary`);
    const fallbackValue = CHART_COLORS[theme].primary;
    const [h, s, l] = fallbackValue.split(' ');
    return `hsl(${h}, ${s}, ${l})`;
  }
  
  // Convert space-separated HSL to comma-separated format
  const [h, s, l] = colorValue.split(' ');
  return `hsl(${h}, ${s}, ${l})`;
}

/**
 * Get service type color mapping for Mapbox circle-color expression
 */
export function getServiceTypeColorExpression(isDark = false): any {
  return [
    'match',
    ['get', 'service_type'],
    'jasa', getMapboxColor('chart-1', isDark),
    'jaringan', getMapboxColor('chart-2', isDark),
    'telekomunikasi_khusus', getMapboxColor('chart-3', isDark),
    'isr', getMapboxColor('chart-4', isDark),
    'tarif', getMapboxColor('chart-5', isDark),
    'sklo', getMapboxColor('primary', isDark),
    'lko', getMapboxColor('secondary', isDark),
    getMapboxColor('chart-1', isDark) // fallback
  ] as any;
}