# BPS Area Management Implementation

## Overview

This implementation provides comprehensive area management capabilities for the BPS (Badan Pusat Statistik) integration, allowing both manual area configuration and automated area fetching from the BPS API.

## Features Implemented

### 1. Manual Area Management
- **UI Interface**: Complete BPS Configuration interface with area management tab
- **CRUD Operations**: Create, Read, Update, Delete areas
- **Area Types**: Support for both provinces and districts
- **Priority Levels**: Configurable priority levels (1-3) for monitoring
- **Parent-Child Relationships**: Districts can be linked to parent provinces

### 2. Automated Area Fetching
- **BPS API Integration**: Fetch areas from `https://webapi.bps.go.id/v1/api/domain/type/all/key/{apiKey}`
- **Data Processing**: Normalize and process raw BPS API responses
- **Database Sync**: Automatically sync fetched areas to the database
- **Error Handling**: Comprehensive error handling and logging

### 3. Database Integration
- **UUID References**: Areas linked to existing `public.provinces` and `public.kabupaten` tables
- **Validation**: Database triggers ensure data consistency
- **Polymorphic Foreign Keys**: Support for both province and district area types
- **Rate Limiting**: Built-in rate limiting for API requests

## Technical Implementation

### Backend Services

#### BPSAPIFetcherService
- **Location**: `server/services/bpsAPIFetcherService.js`
- **Key Functions**:
  - `fetchAreas(apiKey)`: Fetch areas from BPS API
  - `fetchAndSyncAreas(apiKey)`: Fetch and sync areas to database
  - `processAreaData(rawData)`: Process raw API response
  - `normalizeAreaItem(item)`: Normalize individual area items

#### BPSDataService
- **Location**: `server/services/bpsDataService.js`
- **Key Functions**:
  - `getMonitoredAreas(filters)`: Get areas with filters
  - `addMonitoredArea(areaData)`: Add new area
  - `getAreaByBPSCode(bpsCode)`: Get area by BPS code
  - `syncMonitoredAreas()`: Sync from existing tables

### API Endpoints

#### New Endpoints Added
- `POST /panel/api/bps/areas/sync`: Sync areas from BPS API
- `GET /panel/api/bps/areas/test`: Test area fetching without syncing

#### Existing Endpoints Enhanced
- `GET /panel/api/bps/areas`: Get monitored areas
- `POST /panel/api/bps/areas`: Add new area
- `GET /panel/api/bps/config`: Get BPS configuration

### Frontend Components

#### BPSConfiguration Component
- **Location**: `src/components/BPSConfiguration.tsx`
- **New Functions**:
  - `fetchAreasFromAPI()`: Fetch areas from BPS API
  - `syncAreasFromAPI()`: Sync areas to database
- **New UI Elements**:
  - "Fetch Areas from API" button
  - "Sync Areas from API" button
  - Enhanced test result display

## API Parameters

### BPS Area Endpoint
```
GET https://webapi.bps.go.id/v1/api/domain/type/all/key/{apiKey}
```

**Parameters**:
- `apiKey`: Your BPS Web API v1 key
- `type`: Fixed value "all" for getting all area types
- `domain`: Fixed value for area listing

### BPS Data Endpoint (Existing)
```
GET https://webapi.bps.go.id/v1/api/domain/{domainCode}/model/dynamictable/lang/{language}/var/{variableID}/th/{years}/key/{apiKey}
```

**Parameters**:
- `domainCode`: Area code (2-digit for provinces, 4-digit for districts)
- `variableID`: BPS variable ID
- `years`: Comma-separated years
- `language`: Language code (ind for Indonesian)
- `apiKey`: Your BPS Web API v1 key

## Database Schema

### Tables Used
- `bps_monitored_areas`: Monitored areas with BPS codes
- `bps_config`: BPS API configuration
- `public.provinces`: Existing province table
- `public.kabupaten`: Existing district table

### Key Fields
- `area_code`: BPS area code (2-digit for provinces, 4-digit for districts)
- `area_type`: 'province' or 'district'
- `area_id`: UUID reference to existing area tables
- `priority_level`: Monitoring priority (1-3)

## Usage

### Manual Area Management
1. Navigate to BPS Configuration in the admin panel
2. Go to the "Areas" tab
3. Use the "Add New Area" form to manually add areas
4. Configure area type, code, name, and priority level

### Automated Area Fetching
1. Configure BPS API key in the "API Settings" tab
2. Click "Fetch Areas from API" to test the connection and see available areas
3. Click "Sync Areas from API" to fetch and sync areas to the database
4. Monitor progress in the test result section

### API Testing
```bash
# Test area fetching
curl -X GET "http://localhost:3000/panel/api/bps/areas/test"

# Sync areas from API
curl -X POST "http://localhost:3000/panel/api/bps/areas/sync"
```

## Current Limitations

### BPS API Access
- The BPS API endpoints are currently blocked by BPS security systems
- Manual area entry is the primary method until API access is restored
- The implementation is ready for when API access is available

### Data Processing
- Area data processing is based on typical BPS API response patterns
- May need adjustment based on actual API response format
- Error handling is comprehensive but may need refinement

## Future Enhancements

### API Response Handling
- Implement specific response format handling based on actual BPS API
- Add support for pagination if areas are returned in chunks
- Enhance error messages with specific BPS API error codes

### UI Improvements
- Add progress indicators for long-running sync operations
- Implement area preview before syncing
- Add bulk operations for area management

### Data Validation
- Add validation for area code formats
- Implement duplicate detection and handling
- Add data quality checks for fetched areas

## Testing

### Manual Testing
1. Configure BPS API key in the UI
2. Test connection using "Test Connection" button
3. Test area fetching using "Fetch Areas from API" button
4. Test area syncing using "Sync Areas from API" button
5. Verify areas appear in the monitored areas list

### Automated Testing
```bash
# Run the test script
node test_area_sync.js
```

## Conclusion

The BPS area management implementation provides a robust foundation for both manual and automated area configuration. The system is designed to handle the current API access limitations while being ready for full automation when BPS API access is restored.

The implementation follows best practices for:
- Error handling and logging
- Database consistency and validation
- API rate limiting and retry logic
- User interface design and usability
- Code organization and maintainability