# Software Requirements Specification (SRS)
# Enhanced Configurable Report Generator - Web Application

**Version 2.0**
**Date: May 15, 2024**
**Author: Martin Ouimet**

## 1. Introduction

### 1.1 Purpose
This document specifies the requirements for a web-based Configurable Report Generator application that converts images of handwritten or typed notes into professionally formatted PDF reports using customizable templates.

### 1.2 Scope
The application will allow users to upload images containing various types of notes or documentation, process them using OCR, enhance and structure the content using AI, and generate professional PDF reports based on configurable templates. The application will be built using Next.js 15, React 19, TypeScript, Tesseract.js, Vercel AI SDK, and Supabase.

### 1.3 Definitions
- **OCR**: Optical Character Recognition
- **LLM**: Large Language Model
- **PDF**: Portable Document Format
- **RSC**: React Server Components
- **SA**: Server Actions
- **SDK**: Software Development Kit

## 2. Overall Description

### 2.1 Product Perspective
The Enhanced Configurable Report Generator is a modern web application that automates the conversion of handwritten or digital notes into professional PDF reports using customizable templates, leveraging server-first architecture and AI capabilities.

### 2.2 User Requirements
- Upload images containing various types of notes or documentation
- Preview extracted text and make corrections if needed
- Create and manage configurable report templates
- Generate professional PDF reports with AI-enhanced content
- Download the generated reports
- Save and share report templates for future use
- Manage user account and preferences
- Access history of generated reports

### 2.3 Operating Environment
- Modern web browsers (Chrome, Firefox, Safari, Edge)
- Internet connection for LLM processing and database access
- Mobile and desktop responsive design

## 3. Specific Requirements

### 3.1 Functional Requirements

#### 3.1.1 Image Upload
- The system shall allow users to upload images in JPG, PNG, and PDF formats
- The system shall support drag-and-drop functionality for image upload
- The system shall support multiple image uploads for batch processing
- The system shall provide image preview before processing
- The system shall store uploaded images in Supabase Storage
- The system shall allow categorization of uploaded images by document type

#### 3.1.2 OCR Processing
- The system shall extract text from uploaded images using Tesseract.js
- The system shall display the extracted text to the user
- The system shall allow users to edit the extracted text if needed
- The system shall support French language for OCR processing
- The system shall save OCR processing results to the database

#### 3.1.3 AI Content Enhancement
- The system shall use Vercel AI SDK to connect to first-party AI providers
- The system shall process extracted text to improve grammar, structure, and clarity
- The system shall identify and categorize key points based on template requirements
- The system shall maintain consistent terminology throughout the report
- The system shall allow configuration of AI enhancement settings
- The system shall support domain-specific terminology based on template context

#### 3.1.4 Report Generation
- The system shall generate PDF reports with professional formatting based on configurable templates
- The system shall allow users to add a logo, signature, and custom branding elements to the reports
- The system shall provide report preview before download
- The system shall save generated reports to Supabase Storage
- The system shall support creation, editing, and management of multiple report templates
- The system shall allow template sharing between users with appropriate permissions

#### 3.1.5 User Management
- The system shall implement user authentication using Supabase Auth
- The system shall support email/password and social login options
- The system shall implement role-based access control (admin, standard user)
- The system shall save user preferences and templates
- The system shall track user activity and report generation history

### 3.2 Non-Functional Requirements

#### 3.2.1 Performance
- The system shall process images and generate reports within 30 seconds
- The system shall support concurrent users
- The system shall be responsive on both desktop and mobile devices
- The system shall implement efficient data loading with streaming and suspense

#### 3.2.2 Security
- The system shall secure user data using Supabase Row Level Security
- The system shall implement secure authentication with MFA option
- The system shall encrypt sensitive information
- The system shall implement proper CORS and CSP policies
- The system shall follow OWASP security best practices

#### 3.2.3 Usability
- The system shall have an intuitive, user-friendly interface
- The system shall provide clear feedback during processing
- The system shall include help documentation and tooltips
- The system shall support dark/light mode
- The system shall be accessible according to WCAG 2.1 AA standards

## 4. Technical Stack

### 4.1 Frontend Framework
- Next.js 15 for the application framework
- React 19 with Server Components architecture
- TypeScript for type safety
- Server Actions for form handling and mutations
- Client Components only where interactivity is required

### 4.2 State Management
- Server-centric state management using React Server Components
- Minimal client-state using React's built-in hooks (useState, useReducer)
- Form state management with React Hook Form
- Server state revalidation with Next.js cache mechanisms

### 4.3 Styling and UI
- Tailwind CSS for styling
- Shadcn UI component library
- Responsive design principles
- CSS Modules for component-specific styling

### 4.4 OCR and AI Processing
- Tesseract.js for OCR processing
- Vercel AI SDK for LLM integration
- Support for multiple AI providers with first-party provider as default
- Streaming AI responses for better user experience

### 4.5 PDF Generation
- React-PDF for PDF generation
- html2canvas for capturing UI elements as images (if needed)
- PDF preview with PDF.js

### 4.6 Database and Authentication
- Supabase for database, authentication, and storage
- PostgreSQL as the underlying database
- Supabase Auth for user management
- Supabase Storage for file management
- Supabase Row Level Security for data protection

## 5. Database Schema

### 5.1 Users Table
- id (UUID, primary key)
- email (string, unique)
- created_at (timestamp)
- updated_at (timestamp)
- full_name (string)
- avatar_url (string)
- role (enum: admin, user)
- preferences (JSON)

### 5.2 Templates Table
- id (UUID, primary key)
- user_id (UUID, foreign key to users.id)
- name (string)
- description (string)
- category (string)
- created_at (timestamp)
- updated_at (timestamp)
- content (JSON)
- structure (JSON)
- field_mappings (JSON)
- styling (JSON)
- is_public (boolean)
- version (integer)

### 5.3 Reports Table
- id (UUID, primary key)
- user_id (UUID, foreign key to users.id)
- template_id (UUID, foreign key to templates.id)
- title (string)
- created_at (timestamp)
- updated_at (timestamp)
- status (enum: draft, completed)
- original_text (text)
- enhanced_text (text)
- metadata (JSON)
- pdf_url (string)

### 5.4 Images Table
- id (UUID, primary key)
- report_id (UUID, foreign key to reports.id)
- storage_path (string)
- created_at (timestamp)
- ocr_text (text)
- processing_status (enum: pending, processed, failed)
- metadata (JSON)

## 6. System Architecture

### 6.1 Component Overview
1. **Server Components**
   - Authentication Provider
   - Image Upload Component
   - OCR Processing Service
   - AI Enhancement Service
   - PDF Generation Service
   - Database Service

2. **Client Components**
   - Text Editor Component
   - Image Preview Component
   - Report Preview Component
   - User Preference Controls

3. **Server Actions**
   - User Registration/Login Actions
   - Image Upload Actions
   - OCR Processing Actions
   - Report Generation Actions
   - Template Management Actions

### 6.2 Data Flow
1. User authenticates via Supabase Auth
2. User uploads image(s) through Server Action
3. Images are stored in Supabase Storage
4. Server processes image with Tesseract.js OCR
5. OCR results are stored in database
6. User reviews and edits extracted text
7. Server enhances content using Vercel AI SDK
8. Server generates PDF report
9. Report is stored in Supabase Storage
10. User previews and downloads report

## 7. AI Integration

### 7.1 Vercel AI SDK Implementation
- Integration with first-party AI provider
- Streaming responses for real-time feedback
- Prompt engineering for optimal results
- Fallback mechanisms for API unavailability

### 7.2 AI Features
- Grammar and spelling correction
- Text structuring and formatting
- Terminology standardization
- Content enhancement and elaboration
- Identification of key evaluation points
- Summary generation

### 7.3 AI Configuration
- Customizable AI parameters
- Temperature and creativity settings
- Domain-specific prompt templates
- Context window optimization

## 8. Implementation Plan

### 8.1 Phase 1: Project Setup and Authentication (1 week)
- Set up Next.js 15 project with TypeScript
- Configure Supabase project and database schema
- Implement authentication with Supabase Auth
- Create basic layout and navigation
- Set up CI/CD pipeline

### 8.2 Phase 2: Core Functionality (2 weeks)
- Implement image upload with Supabase Storage
- Integrate Tesseract.js for OCR
- Create text editing interface
- Set up Vercel AI SDK with first-party provider
- Implement basic PDF generation

### 8.3 Phase 3: Enhanced Features (2 weeks)
- Develop AI content enhancement features
- Create template management system
- Implement advanced PDF styling and formatting
- Add report history and management
- Develop user preferences system

### 8.4 Phase 4: Refinement and Optimization (1 week)
- Optimize performance and loading states
- Implement error handling and recovery
- Add dark/light mode support
- Improve accessibility
- Enhance responsive design

### 8.5 Phase 5: Testing and Deployment (1 week)
- Conduct comprehensive testing
- Perform security audit
- Optimize for production
- Deploy to Vercel
- Set up monitoring and analytics

## 9. Appendix

### 9.1 User Interface Mockups
(To be developed separately)

### 9.2 Sample Report Templates
- Standard Business Report
- Medical Assessment Report
- Educational Evaluation Report
- Project Status Report
- Financial Analysis Report
- Customer Feedback Report
- Employee Performance Review
- Technical Inspection Report

### 9.3 Supabase Setup Commands
```bash
# Initialize Supabase project
supabase init

# Start Supabase local development
supabase start

# Create database tables
supabase db push

# Generate TypeScript types
supabase gen types typescript --local > types/supabase.ts
```

### 9.4 Next.js Project Setup
```bash
# Create Next.js project
npx create-next-app@latest configurable-report-generator --typescript --tailwind --eslint --app --src-dir

# Install dependencies
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs ai tesseract.js react-pdf @react-pdf/renderer react-hook-form zod @shadcn/ui
```
