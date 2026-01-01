# Kominfo Tarif API Synchronization System - Deployment Guide

## Overview

This comprehensive solution implements a full-stack data synchronization module that consumes the Kominfo Tarif API, stores data in the database, and provides both automated daily synchronization and manual sync capabilities.

## Architecture Components

### Backend Services

1. **KominfoTarifService** (`server/services/kominfoTarifService.js`)
   - Handles API consumption with parameter loops (status: 'sudah'/'belum', jenis: 'jasa'/'jaringan')
   - Implements pagination handling for complete data retrieval
   - Provides data transformation from API format to database format
   - Includes retry logic and error handling

2. **TarifSyncService** (`server/services/tarifSyncService.js`)
   - Implements upsert logic with discrepancy detection
   - Handles batch processing for performance optimization
   - Provides sync logging and statistics
   - Uses PostgreSQL transactions for data integrity

3. **BackgroundJobService** (`server/services/backgroundJobService.js`)
   - Manages scheduled daily and weekly synchronization
   - Provides manual sync triggers
   - Handles graceful shutdown and error recovery
   - Uses node-cron for scheduling

### Database Schema

**New Tables:**
- `kominfo_tarif_data` - Stores synchronized data from Kominfo API
- `kominfo_sync_log` - Tracks synchronization activities and results

### API Endpoints

**Kominfo Sync Routes** (`server/routes/kominfo-sync.js`):
- `POST /panel/api/kominfo-sync/sync/manual` - Trigger manual synchronization
- `GET /panel/api/kominfo-sync/sync/status` - Get sync status and statistics
- `GET /panel/api/kominfo-sync/sync/history` - Get synchronization history
- `GET /panel/api/kominfo-sync/sync/test-api` - Test API connectivity
- `GET /panel/api/kominfo-sync/data` - Retrieve synchronized data

### Frontend Components

**Updated Tarif Page** (`src/pages/services/TarifUpdated.tsx`):
- Manual sync button with real-time status indicators
- Sync statistics display
- Toast notifications for user feedback
- Enhanced UI with sync status badges

## Installation & Setup

### 1. Database Setup

Run the new database schema:

```bash
# Execute the updated schema
psql -d telkom_hub -f server/database/schema/tarif_schema_updated.sql
```

### 2. Environment Configuration

Add to your `.env` file:

```env
# Kominfo Tarif API Configuration
KOMINFO_TARIF_API_KEY=E1Hn8oj
KOMINFO_TARIF_API_BASE_URL=https://tariftel.komdigi.go.id/api/v1/api
KOMINFO_TARIF_DEFAULT_TAHUN=2024
KOMINFO_TARIF_DEFAULT_PERIODE=bulanan
KOMINFO_SYNC_ENABLED=true
```

### 3. Server Integration

**Option A: Update existing server (Recommended)**
1. Copy the new files to your server:
   - `server/services/kominfoTarifService.js`
   - `server/services/tarifSyncService.js`
   - `server/services/backgroundJobService.js`
   - `server/routes/kominfo-sync.js`

2. Add to your existing `server/index.js`:
```javascript
// Add imports
import kominfoSyncRoutes from './routes/kominfo-sync.js';
import backgroundJobService from './services/backgroundJobService.js';

// Add route registration
app.use('/panel/api', kominfoSyncRoutes);

// Initialize background job service
backgroundJobService.initialize().catch(error => {
  console.error('Failed to initialize background job service:', error);
});

// Add graceful shutdown handling
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  await backgroundJobService.shutdown();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...');
  await backgroundJobService.shutdown();
  process.exit(0);
});
```

**Option B: Use the complete server file**
Replace `server/index.js` with `server/index_with_kominfo.js` (contains all existing functionality plus new features).

### 4. Frontend Integration

**Replace the existing Tarif page:**
```bash
# Backup existing file
cp src/pages/services/Tarif.tsx src/pages/services/Tarif.tsx.backup

# Use new version
cp src/pages/services/TarifUpdated.tsx src/pages/services/Tarif.tsx
```

**Ensure dependencies are installed:**
```bash
npm install sonner  # For toast notifications (if not already installed)
```

## Usage

### Manual Synchronization

1. **From Frontend:**
   - Navigate to the Tarif page
   - Click "Sync Manual" button
   - Monitor sync status and results

2. **From API:**
   ```bash
   curl -X POST http://localhost:4000/panel/api/kominfo-sync/sync/manual \
     -H "Content-Type: application/json" \
     -d '{"tahun": 2024, "periode": "bulanan"}'
   ```

### Automated Synchronization

The system automatically runs:
- **Daily sync** at 2:00 AM WIB
- **Weekly sync** on Sundays at 1:00 AM WIB

To check sync status:
```bash
curl http://localhost:4000/panel/api/kominfo-sync/sync/status
```

### Monitoring & Logs

**View sync history:**
```bash
curl http://localhost:4000/panel/api/kominfo-sync/sync/history?limit=10
```

**Test API connectivity:**
```bash
curl http://localhost:4000/panel/api/kominfo-sync/sync/test-api
```

## API Parameter Strategy

The system automatically handles all parameter combinations:

```javascript
// Status loop: ['sudah', 'belum']
// Jenis loop: ['jasa', 'jaringan']
// Results in 4 combinations:
// 1. status='sudah', jenis='jasa'
// 2. status='sudah', jenis='jaringan'
// 3. status='belum', jenis='jasa'
// 4. status='belum', jenis='jaringan'
```

For each combination, the system:
1. Fetches all pages using pagination (`from` parameter)
2. Transforms data to database format
3. Performs upsert operations with discrepancy detection
4. Logs all activities for monitoring

## Database Operations

### Upsert Logic

The system uses a sophisticated upsert strategy:

1. **Insert New Records:** When UID doesn't exist in database
2. **Update Existing Records:** When data differs from stored version
3. **No Action:** When data is identical (just updates sync timestamp)

### Performance Optimization

- **Batch Processing:** Records processed in batches of 50
- **Transaction Safety:** Each batch wrapped in database transaction
- **Indexing:** Optimized indexes on key fields for fast queries
- **Pagination:** Efficient data retrieval from API

## Error Handling & Recovery

### API-Level Errors
- Retry logic with exponential backoff (3 attempts)
- Connection timeout handling
- Rate limiting consideration

### Database-Level Errors
- Transaction rollback on failures
- Detailed error logging
- Partial success handling (continues with remaining batches)

### Monitoring
- Comprehensive sync logging
- Success/failure statistics
- Error message tracking
- Performance metrics

## Security Considerations

### API Key Management
- Stored in environment variables
- Not exposed in client-side code
- Secure transmission (HTTPS only)

### Input Validation
- Parameter sanitization
- SQL injection prevention
- Request size limits

## Troubleshooting

### Common Issues

1. **API Connection Failed**
   - Check internet connectivity
   - Verify API endpoint is accessible
   - Confirm API key is valid

2. **Database Errors**
   - Ensure schema is properly installed
   - Check database permissions
   - Verify connection string

3. **Sync Failures**
   - Check logs for specific error messages
   - Verify API response format
   - Ensure sufficient database storage

### Log Analysis

Check server logs for:
- Sync start/completion messages
- API response times
- Database operation results
- Error details and stack traces

## Production Deployment

### Environment Variables
Set production values:
```env
KOMINFO_TARIF_API_KEY=your_production_api_key
KOMINFO_SYNC_ENABLED=true
NODE_ENV=production
```

### Process Management
Use PM2 or similar for production deployment:
```bash
pm2 start server/index.js --name "telkom-hub"
pm2 startup
pm2 save
```

### Monitoring
Set up monitoring for:
- Sync job health
- API response times
- Database performance
- Error rates

## Backup & Recovery

### Database Backup
```bash
# Backup kominfo tables
pg_dump -t kominfo_tarif_data -t kominfo_sync_log telkom_hub > kominfo_backup.sql
```

### Configuration Backup
```bash
# Backup environment and schema
cp .env .env.backup
cp server/database/schema/tarif_schema_updated.sql schema_backup.sql
```

## Maintenance

### Regular Tasks
- Monitor sync logs weekly
- Check API response times
- Review error patterns
- Update API endpoint if changed

### Performance Tuning
- Monitor database query performance
- Adjust batch sizes if needed
- Optimize indexes based on usage patterns

## Support & Documentation

For issues or questions:
1. Check server logs for error details
2. Review sync status via API endpoints
3. Verify all configuration settings
4. Test API connectivity manually

This comprehensive solution provides a robust, scalable system for synchronizing Kominfo Tarif data with your database while maintaining data integrity and providing excellent user experience through both automated and manual sync capabilities.