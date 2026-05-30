# Mass Upload Feature

## Overview
Implement a feature for mass uploading data via an Excel file from an "admin-restricted" page. The process includes downloading a template, uploading a populated file, previewing a summary with validations (new data, data to be updated, and invalid data), and finally committing the changes (insert/update) to the Google Sheet database upon user verification.

## Socratic Gate / Open Questions
- Is there already an `admin-restricted` layout/route, or do we need to create it from scratch with authentication guards?
- What are the exact columns present in "Form Response 1" to include in the Excel template alongside the "keterangan" column?
- What is the primary key or unique identifier used to distinguish between "new data" and "data to be updated"?
- Are there any specific validation rules for the columns (e.g., date formats, number ranges)?

## Project Type
WEB

## Success Criteria
- User can navigate to the mass upload page from an admin-restricted area.
- User can download an Excel template formatted with "Form Response 1" columns plus "keterangan".
- Uploaded Excel files are parsed and validated on the frontend/backend before saving.
- A summary preview correctly identifies: New records, records to update, and invalid records with errors.
- Verified data is correctly inserted or updated in the Google Sheet database when the user clicks "Simpan".

## Tech Stack
- **Frontend**: Next.js (App Router), React, Tailwind CSS
- **Excel Parsing/Generation**: `xlsx` or `exceljs` library for handling Excel files.
- **Backend/API**: Next.js Route Handlers to communicate with Google Sheets API.
- **Database**: Google Sheets API (acting as the DB).

## File Structure
- `src/app/(main)/admin-restricted/mass-upload/page.tsx` (Page UI)
- `src/modules/dashboard/components/MassUploadPreview.tsx` (Preview Table/Summary)
- `src/app/api/mass-upload/route.ts` (API for handling insert/update to Google Sheet)
- `src/app/api/template/route.ts` (API for generating/downloading Excel template)
- `src/lib/excel-utils.ts` (Utility for parsing and creating Excel files)

## Task Breakdown

### 1. Setup Admin Restricted Route & Navigation
- **agent**: frontend-specialist
- **skills**: react-patterns, frontend-design
- **priority**: P1
- **INPUT**: Request to create an admin-restricted mass upload page.
- **OUTPUT**: `src/app/(main)/admin-restricted/mass-upload/page.tsx` and a navigation shortcut.
- **VERIFY**: Ensure the page is accessible only to admins and the shortcut is visible in the admin sidebar/menu.

### 2. Implement Excel Template Generation & Download
- **agent**: backend-specialist
- **skills**: api-patterns
- **priority**: P1
- **dependencies**: Task 1
- **INPUT**: Column list (Form Response 1 + "keterangan").
- **OUTPUT**: API endpoint or client-side utility to download `.xlsx` template.
- **VERIFY**: Downloaded file opens correctly in Excel and contains the specified columns.

### 3. Build Excel File Upload & Client-Side Parsing
- **agent**: frontend-specialist
- **skills**: react-patterns
- **priority**: P1
- **dependencies**: Task 1
- **INPUT**: Uploaded Excel file.
- **OUTPUT**: Parsed JSON array of rows.
- **VERIFY**: File input accepts `.xlsx` files and successfully converts them into structured data without saving to the DB.

### 4. Implement Data Validation & Summary Preview UI
- **agent**: frontend-specialist
- **skills**: frontend-design, react-patterns
- **priority**: P1
- **dependencies**: Task 3
- **INPUT**: Parsed data rows.
- **OUTPUT**: UI showing summary statistics (New, Update, Invalid) and a detailed table.
- **VERIFY**: Invalid rows are highlighted with errors, and data categorizations (new vs. update) are accurate based on the unique identifier.

### 5. Create Google Sheets Insert/Update API
- **agent**: backend-specialist
- **skills**: api-patterns, database-design
- **priority**: P0
- **dependencies**: Task 4
- **INPUT**: Validated array of new and updated records.
- **OUTPUT**: API endpoint that interacts with Google Sheets to batch insert and update.
- **VERIFY**: Data correctly reflects in the Google Sheet after the API is called.

### 6. Connect UI "Simpan" Button to API
- **agent**: frontend-specialist
- **skills**: react-patterns
- **priority**: P1
- **dependencies**: Task 4, Task 5
- **INPUT**: Verified data summary.
- **OUTPUT**: Trigger save operation, show loading state, and handle success/error feedback.
- **VERIFY**: Clicking "Simpan" successfully calls the API, updates the database, and shows a success toast.

## Phase X: Verification
- [ ] Lint & Type Check: `npm run lint` && `npx tsc --noEmit`
- [ ] Security Scan: Ensure no sensitive data is exposed in the Excel parsing and API endpoints.
- [ ] Build Check: `npm run build` succeeds without errors.
- [ ] UX Audit: Ensure the upload summary table is clear and responsive.
- [ ] Test functionality manually: Upload a file with mixed valid/invalid data, verify preview, and confirm saving works accurately.

## ✅ PHASE X COMPLETE
- Lint: [ ] Pass
- Security: [ ] No critical issues
- Build: [ ] Success
- Date: [Pending Execution]
