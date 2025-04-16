# Database Schema Documentation

This document provides detailed information about the database schema for the Configurable Report Generator application.

## Overview

The database schema consists of the following tables:

1. **profiles** - Extends the Supabase auth.users table with additional user information
2. **templates** - Stores report templates
3. **template_sharing** - Manages template sharing between users
4. **reports** - Stores generated reports
5. **images** - Stores metadata for uploaded images

## Tables

### Profiles Table

Extends the Supabase auth.users table with additional user information.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key, references auth.users(id) |
| updated_at | TIMESTAMP WITH TIME ZONE | Last update timestamp |
| username | TEXT | Unique username |
| full_name | TEXT | User's full name |
| avatar_url | TEXT | URL to user's avatar image |
| role | TEXT | User role ('admin' or 'user') |
| preferences | JSONB | User preferences stored as JSON |

**Row Level Security Policies:**
- Users can view their own profile
- Users can update their own profile
- Admins can view all profiles

**Triggers:**
- `on_auth_user_created`: Creates a profile when a new user signs up

### Templates Table

Stores report templates created by users.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| created_at | TIMESTAMP WITH TIME ZONE | Creation timestamp |
| updated_at | TIMESTAMP WITH TIME ZONE | Last update timestamp |
| name | TEXT | Template name |
| description | TEXT | Template description |
| structure | JSONB | Template structure stored as JSON |
| styling | JSONB | Template styling stored as JSON |
| is_public | BOOLEAN | Whether the template is public |
| version | INTEGER | Template version number |
| owner_id | UUID | References auth.users(id) |
| parent_id | UUID | References templates(id) for template versioning |

**Row Level Security Policies:**
- Users can view their own templates
- Users can view public templates
- Users can view templates shared with them
- Users can insert their own templates
- Users can update their own templates
- Users can delete their own templates
- Admins can view all templates

### Template Sharing Table

Manages template sharing between users.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| created_at | TIMESTAMP WITH TIME ZONE | Creation timestamp |
| template_id | UUID | References templates(id) |
| shared_with | UUID | References auth.users(id) |

**Row Level Security Policies:**
- Users can view their own template sharing
- Users can insert their own template sharing
- Users can delete their own template sharing

### Reports Table

Stores generated reports.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| created_at | TIMESTAMP WITH TIME ZONE | Creation timestamp |
| updated_at | TIMESTAMP WITH TIME ZONE | Last update timestamp |
| title | TEXT | Report title |
| content | JSONB | Report content stored as JSON |
| status | TEXT | Report status ('draft' or 'completed') |
| owner_id | UUID | References auth.users(id) |
| template_id | UUID | References templates(id) |
| pdf_url | TEXT | URL to the generated PDF |

**Row Level Security Policies:**
- Users can view their own reports
- Users can insert their own reports
- Users can update their own reports
- Users can delete their own reports
- Admins can view all reports

### Images Table

Stores metadata for uploaded images.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| created_at | TIMESTAMP WITH TIME ZONE | Creation timestamp |
| updated_at | TIMESTAMP WITH TIME ZONE | Last update timestamp |
| filename | TEXT | Original filename |
| storage_path | TEXT | Path in storage bucket |
| mime_type | TEXT | MIME type of the image |
| size | INTEGER | File size in bytes |
| width | INTEGER | Image width in pixels |
| height | INTEGER | Image height in pixels |
| ocr_text | TEXT | Extracted text from OCR |
| ocr_language | TEXT | Language used for OCR |
| owner_id | UUID | References auth.users(id) |
| report_id | UUID | References reports(id) |

**Row Level Security Policies:**
- Users can view their own images
- Users can insert their own images
- Users can update their own images
- Users can delete their own images
- Admins can view all images

## Relationships

- **profiles** has a one-to-one relationship with **auth.users**
- **templates** has a many-to-one relationship with **auth.users** (owner)
- **templates** has a self-referential relationship for versioning (parent_id)
- **template_sharing** has a many-to-one relationship with **templates**
- **template_sharing** has a many-to-one relationship with **auth.users** (shared_with)
- **reports** has a many-to-one relationship with **auth.users** (owner)
- **reports** has a many-to-one relationship with **templates**
- **images** has a many-to-one relationship with **auth.users** (owner)
- **images** has a many-to-one relationship with **reports**

## Triggers

- **handle_new_user**: Creates a profile when a new user signs up
- **handle_updated_at**: Updates the updated_at timestamp when a record is updated

## Row Level Security

Row Level Security (RLS) is enabled on all tables to ensure that users can only access their own data or data that has been explicitly shared with them. Admins have additional permissions to view all data.

## Utility Functions

The following utility functions are available for interacting with the database:

### Profiles
- `getCurrentProfile()`: Get the current user's profile
- `updateProfile(profile)`: Update the current user's profile
- `getProfileById(id)`: Get a user's profile by ID
- `getAllProfiles()`: Get all profiles (admin only)

### Templates
- `getUserTemplates()`: Get all templates for the current user
- `getPublicTemplates()`: Get all public templates
- `getTemplateById(id)`: Get a template by ID
- `createTemplate(template)`: Create a new template
- `updateTemplate(id, template)`: Update a template
- `deleteTemplate(id)`: Delete a template
- `shareTemplate(templateId, userId)`: Share a template with another user
- `getTemplateSharing(templateId)`: Get users a template is shared with
- `removeTemplateSharing(templateId, userId)`: Remove template sharing

### Reports
- `getUserReports()`: Get all reports for the current user
- `getReportById(id)`: Get a report by ID
- `createReport(report)`: Create a new report
- `updateReport(id, report)`: Update a report
- `deleteReport(id)`: Delete a report
- `getReportsByTemplate(templateId)`: Get reports by template ID

### Images
- `getReportImages(reportId)`: Get all images for a report
- `getImageById(id)`: Get an image by ID
- `createImage(image)`: Create a new image record
- `updateImage(id, image)`: Update an image record
- `deleteImage(id)`: Delete an image record
- `uploadImage(file, reportId, ownerId)`: Upload an image to storage and create a record
- `getImageUrl(storagePath)`: Get a public URL for an image
