# Project Architecture

This document describes the current architecture of the Jonnah Workout Church Management System.

## System Overview

The application is structured as a modern web admin dashboard with a separated frontend and backend.

Frontend:
- React
- TypeScript
- Vite
- TailwindCSS

Backend:
- PHP API (api-gkii directory)
- Expected database: MySQL

The frontend communicates with the PHP API endpoints to retrieve and manage church data.

## Main Modules

### 1. Jemaat Management
Handles congregation member records.

Features:
- list members
- add member
- edit member
- view member details

Location:
src/pages/Jemaat

### 2. Family Management
Handles relationships between church members and family groups.

Location:
src/pages/Jemaat/DataKeluarga

### 3. Prayer Groups
Manages prayer groups (Kelompok Doa).

Location:
src/pages/Jemaat/DataKelompokDoa

### 4. Church Departments
Handles church organizational sections.

Location:
src/pages/Jemaat/DataSeksi

## Frontend Structure

src/
  components/
  pages/
  layout/
  context/
  hooks/

The UI is component‑based and uses TailwindCSS for styling.

## Backend Structure

api-gkii/
  config/
  endpoints

The backend exposes endpoints used by the frontend dashboard.

## Future Architecture Goals

- Add service layer between frontend and API
- Add authentication middleware
- Add centralized API client
- Introduce testing layer

## Long Term Vision

Transform this project into a full church management platform including:

- member lifecycle management
- attendance tracking
- ministry management
- reporting & analytics

This document will evolve as the system architecture improves.
