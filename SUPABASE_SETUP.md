# Supabase Setup Instructions

## Overview
Your Solution Property application is now integrated with Supabase for:
- Database storage of all inspection data
- File storage for inspection photos
- Real-time data synchronization

## Database Setup

1. **Access your Supabase Project**
   - Go to https://supabase.com and log in
   - Navigate to your project dashboard

2. **Create Database Tables**
   - Go to the SQL Editor in your Supabase dashboard
   - Copy and paste the contents of `src/lib/supabase-schema.sql`
   - Click "Run" to create all necessary tables and policies

3. **Verify Storage Bucket**
   - Go to Storage in your Supabase dashboard
   - You should see an "inspection-photos" bucket
   - If not, the SQL script will create it automatically

## Features Implemented

### 1. Database Integration
- All inspections are saved to Supabase database
- Automatic loading of inspections on app startup
- Real-time updates when new inspections are added

### 2. File Storage
- Photos are uploaded to Supabase Storage
- Secure public URLs for photo access
- Automatic file naming to prevent conflicts

### 3. PDF Export
- Print button generates professional PDF reports
- Includes all inspection details and photos
- Well-formatted for printing or digital sharing

## Database Structure

### Tables Created:
1. **inspections** - Main inspection records
2. **inspection_areas** - Areas within each inspection
3. **inspection_items** - Individual inspection points

### Storage:
- **inspection-photos** bucket for all uploaded images

## Security Notes
- Row Level Security (RLS) is enabled on all tables
- Current policies allow public read/write (adjust based on your auth requirements)
- Consider implementing authentication for production use

## Testing the Integration

1. Create a new inspection
2. Add inspection points and upload photos
3. Save the inspection
4. Verify data appears in Supabase dashboard
5. Test PDF export functionality

## Troubleshooting

If you encounter issues:
1. Check browser console for errors
2. Verify Supabase URL and API key in `src/integrations/supabase/client.ts`
3. Ensure all tables were created successfully
4. Check Supabase dashboard logs for any errors