/**
 * BPS Data Normalizer Service
 * Transforms complex BPS "Cube" JSON into chart-ready relational format
 * Handles the Header-Stub-Data structure and decodes composite keys
 */
export class BPSDataNormalizerService {
  
  constructor() {
    this.supportedStructures = [
      'standard_cube',    // Standard BPS cube structure
      'simplified',       // Simplified response format
      'multi_variable'    // Multiple variables in one response
    ];
  }

  /**
   * Main normalization entry point
   * @param {Object} rawData - Raw BPS API response
   * @param {Object} options - Normalization options
   * @returns {Object} Normalized data
   */
  normalize(rawData, options = {}) {
    try {
      console.log('Starting BPS data normalization...');
      
      // Detect response structure
      const structure = this.detectStructure(rawData);
      console.log(`Detected structure: ${structure}`);
      
      switch (structure) {
        case 'standard_cube':
          return this.normalizeStandardCube(rawData, options);
        case 'simplified':
          return this.normalizeSimplified(rawData, options);
        case 'multi_variable':
          return this.normalizeMultiVariable(rawData, options);
        default:
          throw new Error(`Unsupported BPS response structure: ${structure}`);
      }
      
    } catch (error) {
      console.error('BPS data normalization failed:', error);
      return {
        success: false,
        error: error.message,
        originalData: rawData
      };
    }
  }

  /**
   * Detect the structure of BPS response
   * @param {Object} data - Raw BPS response
   * @returns {string} Structure type
   */
  detectStructure(data) {
    // Standard BPS cube structure has these key arrays
    if (data.vervar && data.var && data.turvar && data.tahun && data.datacontent) {
      return 'standard_cube';
    }
    
    // Simplified structure (direct data arrays)
    if (data.data && Array.isArray(data.data) && data.metadata) {
      return 'simplified';
    }
    
    // Multi-variable structure
    if (data.variables && Array.isArray(data.variables)) {
      return 'multi_variable';
    }
    
    throw new Error('Unknown or invalid BPS response structure');
  }

  /**
   * Normalize standard BPS cube structure
   * @param {Object} data - Raw BPS cube data
   * @param {Object} options - Options
   * @returns {Object} Normalized data
   */
  normalizeStandardCube(data, options = {}) {
    const {
      outputFormat = 'records', // 'records', 'pivot', 'timeseries'
      includeMetadata = true,
      flattenNested = true
    } = options;

    // Step 1: Parse metadata arrays
    const metadata = this.parseMetadataArrays(data);
    
    // Step 2: Decode datacontent keys and map to records
    const records = this.decodeDataContent(data.datacontent, metadata);
    
    // Step 3: Apply options and formatting
    let formattedRecords = records;
    
    if (flattenNested) {
      formattedRecords = this.flattenRecords(records);
    }
    
    // Step 4: Format according to output requirements
    let finalOutput;
    
    switch (outputFormat) {
      case 'records':
        finalOutput = this.formatAsRecords(formattedRecords, metadata);
        break;
      case 'pivot':
        finalOutput = this.formatAsPivot(formattedRecords);
        break;
      case 'timeseries':
        finalOutput = this.formatAsTimeSeries(formattedRecords);
        break;
      default:
        finalOutput = this.formatAsRecords(formattedRecords, metadata);
    }

    return {
      success: true,
      data: finalOutput,
      metadata: includeMetadata ? metadata : undefined,
      summary: {
        totalRecords: records.length,
        years: metadata.years,
        areas: metadata.areas,
        variables: metadata.variables,
        units: metadata.units
      }
    };
  }

  /**
   * Parse metadata arrays from BPS response
   * @param {Object} data - BPS cube data
   * @returns {Object} Parsed metadata
   */
  parseMetadataArrays(data) {
    const metadata = {
      variables: [],
      areas: [],
      units: [],
      years: [],
      timeUnits: []
    };

    // Parse vervar (variables)
    if (data.vervar && Array.isArray(data.vervar)) {
      metadata.variables = data.vervar.map(item => ({
        id: item.val,
        name: item.label,
        code: item.val?.toString()
      }));
    }

    // Parse var (areas/locations)
    if (data.var && Array.isArray(data.var)) {
      metadata.areas = data.var.map(item => ({
        id: item.val,
        name: item.label,
        code: item.val?.toString(),
        type: this.determineAreaType(item.val)
      }));
    }

    // Parse turvar (units/time dimensions)
    if (data.turvar && Array.isArray(data.turvar)) {
      metadata.units = data.turvar.map(item => ({
        id: item.val,
        name: item.label,
        code: item.val?.toString()
      }));
    }

    // Parse tahun (years/time periods)
    if (data.tahun && Array.isArray(data.tahun)) {
      metadata.years = data.tahun.map(item => ({
        id: item.val,
        value: item.label,
        code: item.val?.toString()
      }));
    }

    // Parse period information if available
    if (data.period) {
      metadata.periods = data.period.map(item => ({
        id: item.val,
        name: item.label,
        code: item.val?.toString()
      }));
    }

    console.log('Parsed metadata:', {
      variables: metadata.variables.length,
      areas: metadata.areas.length,
      units: metadata.units.length,
      years: metadata.years.length
    });

    return metadata;
  }

  /**
   * Determine area type from area code
   * @param {number|string} areaCode - Area code
   * @returns {string} Area type
   */
  determineAreaType(areaCode) {
    const code = areaCode?.toString() || '';
    
    // 2-digit codes are provinces
    if (code.length === 2) {
      return 'province';
    }
    
    // 4-digit codes are districts/cities
    if (code.length === 4) {
      return 'district';
    }
    
    // 1-digit codes might be national level
    if (code.length === 1) {
      return 'national';
    }
    
    return 'unknown';
  }

  /**
   * Decode datacontent keys and map to records
   * @param {Object} datacontent - Raw data content
   * @param {Object} metadata - Parsed metadata
   * @returns {Array} Decoded records
   */
  decodeDataContent(datacontent, metadata) {
    const records = [];
    
    console.log(`Decoding ${Object.keys(datacontent).length} datacontent entries...`);
    
    for (const [key, value] of Object.entries(datacontent)) {
      try {
        // Decode the composite key - pattern is usually: var_id + unit_id + year_id
        const decoded = this.decodeCompositeKey(key, metadata);
        
        if (decoded) {
          records.push({
            ...decoded,
            rawValue: value,
            formattedValue: this.formatValue(value, decoded.unit),
            dataKey: key
          });
        }
        
      } catch (error) {
        console.warn(`Failed to decode key "${key}":`, error.message);
      }
    }
    
    console.log(`Successfully decoded ${records.length} records`);
    return records;
  }

  /**
   * Decode composite key from datacontent
   * @param {string} key - Composite key (e.g., "101112023")
   * @param {Object} metadata - Parsed metadata
   * @returns {Object|null} Decoded key components
   */
  decodeCompositeKey(key, metadata) {
    // Try different decoding patterns
    const patterns = [
      // Pattern: var(3) + unit(2) + year(4)
      { var: 3, unit: 2, year: 4 },
      // Pattern: var(2) + unit(2) + year(4) 
      { var: 2, unit: 2, year: 4 },
      // Pattern: var(4) + unit(1) + year(4)
      { var: 4, unit: 1, year: 4 },
      // Pattern: var(3) + unit(1) + year(4)
      { var: 3, unit: 1, year: 4 }
    ];

    for (const pattern of patterns) {
      try {
        const decoded = this.tryDecodePattern(key, pattern, metadata);
        if (decoded) {
          return decoded;
        }
      } catch (error) {
        // Continue to next pattern
        continue;
      }
    }

    console.warn(`Could not decode key "${key}" with any pattern`);
    return null;
  }

  /**
   * Try a specific decoding pattern
   * @param {string} key - Composite key
   * @param {Object} pattern - Decoding pattern
   * @param {Object} metadata - Parsed metadata
   * @returns {Object|null} Decoded result
   */
  tryDecodePattern(key, pattern, metadata) {
    let position = 0;
    
    // Extract components based on pattern
    const varPart = key.substring(position, position + pattern.var);
    position += pattern.var;
    
    const unitPart = key.substring(position, position + pattern.unit);
    position += pattern.unit;
    
    const yearPart = key.substring(position, position + pattern.year);
    
    // Convert to numbers and validate
    const varId = parseInt(varPart);
    const unitId = parseInt(unitPart);
    const yearId = parseInt(yearPart);
    
    // Validate against metadata
    const variable = metadata.variables.find(v => v.id === varId);
    const unit = metadata.units.find(u => u.id === unitId);
    const year = metadata.years.find(y => y.id === yearId);
    
    if (!variable || !unit || !year) {
      return null; // Invalid pattern match
    }
    
    // Find area - this is trickier as we need to determine which area this data belongs to
    // For now, we'll need additional logic to map variables to areas
    const area = this.findAreaForVariable(varId, metadata);
    
    return {
      variableId: varId,
      variableName: variable.name,
      areaId: area?.id,
      areaName: area?.name,
      areaCode: area?.code,
      areaType: area?.type,
      unitId: unitId,
      unitName: unit.name,
      yearId: yearId,
      yearValue: year.value,
      period: 'annual', // Default period
      pattern: pattern
    };
  }

  /**
   * Find area for a variable (this might need context from the API call)
   * @param {number} varId - Variable ID
   * @param {Object} metadata - Parsed metadata
   * @returns {Object|null} Area object
   */
  findAreaForVariable(varId, metadata) {
    // This is a simplified implementation
    // In reality, you might need to pass the domain/area context from the API call
    // For now, we'll try to match by ID or return the first area
    
    // Try to find area with matching ID
    const areaById = metadata.areas.find(a => a.id === varId);
    if (areaById) {
      return areaById;
    }
    
    // If no match, return the first area (this might not be correct)
    // In practice, you'd need to track which area was requested in the API call
    return metadata.areas[0] || null;
  }

  /**
   * Format raw value with proper formatting
   * @param {*} value - Raw value
   * @param {string} unit - Unit of measurement
   * @returns {string} Formatted value
   */
  formatValue(value, unit) {
    if (value === null || value === undefined) {
      return 'N/A';
    }
    
    const numValue = parseFloat(value);
    
    if (isNaN(numValue)) {
      return value.toString();
    }
    
    // Apply unit-specific formatting
    switch (unit?.toLowerCase()) {
      case 'ton':
      case 'tons':
        return `${numValue.toLocaleString('id-ID')} ton`;
      case 'kg':
      case 'kilogram':
        return `${numValue.toLocaleString('id-ID')} kg`;
      case 'juta rupiah':
      case 'miliar rupiah':
        return `${numValue.toLocaleString('id-ID')} ${unit}`;
      case 'persen':
      case '%':
        return `${numValue.toFixed(1)}%`;
      default:
        return numValue.toLocaleString('id-ID');
    }
  }

  /**
   * Flatten nested record structure
   * @param {Array} records - Nested records
   * @returns {Array} Flattened records
   */
  flattenRecords(records) {
    return records.map(record => ({
      // Core fields
      year: record.yearValue,
      area: record.areaName,
      areaCode: record.areaCode,
      areaType: record.areaType,
      variable: record.variableName,
      variableId: record.variableId,
      unit: record.unitName,
      unitId: record.unitId,
      
      // Values
      value: record.rawValue,
      formattedValue: record.formattedValue,
      
      // Metadata
      period: record.period,
      dataKey: record.dataKey
    }));
  }

  /**
   * Format data as simple records array
   * @param {Array} records - Flattened records
   * @param {Object} metadata - Original metadata
   * @returns {Array} Formatted records
   */
  formatAsRecords(records, metadata) {
    return records;
  }

  /**
   * Format data as pivot table (for Recharts)
   * @param {Array} records - Flattened records
   * @returns {Array} Pivot-formatted data
   */
  formatAsPivot(records) {
    const pivotData = {};
    
    // Group by year
    records.forEach(record => {
      const year = record.year;
      
      if (!pivotData[year]) {
        pivotData[year] = { year: year.toString() };
      }
      
      // Create column for each area
      const columnName = record.area;
      pivotData[year][columnName] = record.value;
    });
    
    return Object.values(pivotData).sort((a, b) => a.year.localeCompare(b.year));
  }

  /**
   * Format data as time series
   * @param {Array} records - Flattened records
   * @returns {Object} Time series formatted data
   */
  formatAsTimeSeries(records) {
    const timeSeries = {};
    const areas = new Set();
    const variables = new Set();
    
    records.forEach(record => {
      areas.add(record.area);
      variables.add(record.variable);
      
      const key = `${record.variable}_${record.area}`;
      
      if (!timeSeries[key]) {
        timeSeries[key] = {
          variable: record.variable,
          area: record.area,
          areaCode: record.areaCode,
          unit: record.unit,
          data: []
        };
      }
      
      timeSeries[key].data.push({
        year: record.year,
        value: record.value,
        formattedValue: record.formattedValue
      });
    });
    
    return {
      series: Object.values(timeSeries),
      areas: Array.from(areas),
      variables: Array.from(variables)
    };
  }

  /**
   * Normalize simplified BPS response
   * @param {Object} data - Simplified BPS data
   * @param {Object} options - Options
   * @returns {Object} Normalized data
   */
  normalizeSimplified(data, options = {}) {
    // Handle simplified response format
    const records = data.data.map(item => ({
      year: item.year,
      area: item.area,
      areaCode: item.areaCode,
      variable: item.variable,
      value: item.value,
      unit: item.unit || data.metadata?.unit
    }));
    
    return {
      success: true,
      data: records,
      metadata: data.metadata
    };
  }

  /**
   * Normalize multi-variable BPS response
   * @param {Object} data - Multi-variable BPS data
   * @param {Object} options - Options
   * @returns {Object} Normalized data
   */
  normalizeMultiVariable(data, options = {}) {
    const allRecords = [];
    
    data.variables.forEach(variable => {
      const normalized = this.normalizeStandardCube(variable.data, options);
      if (normalized.success) {
        allRecords.push(...normalized.data);
      }
    });
    
    return {
      success: true,
      data: allRecords
    };
  }

  /**
   * Validate normalized data
   * @param {Object} normalizedData - Normalized data object
   * @returns {Object} Validation result
   */
  validateNormalizedData(normalizedData) {
    const validation = {
      isValid: true,
      errors: [],
      warnings: []
    };
    
    if (!normalizedData.success) {
      validation.isValid = false;
      validation.errors.push('Normalization failed');
      return validation;
    }
    
    const data = normalizedData.data;
    
    if (!Array.isArray(data) || data.length === 0) {
      validation.isValid = false;
      validation.errors.push('No data records found');
      return validation;
    }
    
    // Check required fields
    const requiredFields = ['year', 'area', 'variable', 'value'];
    const firstRecord = data[0];
    
    requiredFields.forEach(field => {
      if (!(field in firstRecord)) {
        validation.warnings.push(`Missing field: ${field}`);
      }
    });
    
    // Check for data quality issues
    const nullValues = data.filter(record => record.value === null || record.value === undefined);
    if (nullValues.length > 0) {
      validation.warnings.push(`${nullValues.length} records have null/undefined values`);
    }
    
    return validation;
  }
}

export default BPSDataNormalizerService;