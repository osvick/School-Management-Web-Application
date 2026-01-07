# School Management Website

A web-based school management application built with React and Firebase, featuring separate dashboards for administrators, teachers, students, and parents.

## 🌐 Overview
This project was developed to simulate a real-world school management system.  
It focuses on role-based access, structured dashboards, and clear presentation of academic and administrative data.

The application demonstrates how frontend interfaces interact with a backend service to manage users, records, and permissions.

## 👥 User Roles & Dashboards
The platform includes the following dashboards:

- **Admin Dashboard**
  - Manage users (teachers, students, parents)
  - Oversee school records and system settings

- **Teacher Dashboard**
  - View assigned students
  - Manage academic-related information

- **Student Dashboard**
  - Access personal academic information
  - View assigned data and updates

- **Parent Dashboard**
  - Monitor student-related information
  - View relevant academic records

## ✨ Key Features
- Role-based dashboards and navigation
- Authentication and data management with Firebase
- Responsive and user-friendly interface
- Structured layout for educational workflows

## 🛠 Tech Stack
- React
- Firebase (Authentication & Database)
- JavaScript
- CSS / Tailwind CSS (if applicable)

## 🔐 Authentication & Authorization

This application implements role-based authentication using Firebase Authentication.

Users are authenticated via email and password, and access is controlled based on assigned roles. Each role is directed to a dedicated dashboard with permissions tailored to their responsibilities.

### User Roles
- **Admin** – System management and user oversight
- **Teacher** – Access to assigned academic information
- **Student** – Access to personal academic records
- **Parent** – View-only access to student-related information

### Access Control
Authorization logic ensures that users can only access routes and data permitted to their role. Unauthorized access to restricted dashboards is prevented both at the UI and data level.

### Demo Access
For security reasons, real credentials are not exposed publicly.

If you would like to explore the dashboards, temporary demo access can be provided upon request.


## 📸 Screenshots
Screenshots of the dashboards and user interfaces are included in the repository.

### Admin Dashboard
![Admin Dashboard](./Screenshots//Admin%20Dasboard.png)

### Teacher Dashboard
![Teacher Dashboard](./Screenshots//Teacher%20Dashboard.png)

### Student Dashboard
![Student Dashboard](./Screenshots/Student%20Dashboard.png)

### Parent Dashboard
![Parent Dashboard](./Screenshots/Parent%20Dashboad.png)


## 📂 Project Purpose
This project was built to:
- Practice building multi-role web applications
- Understand authentication and backend integration using Firebase
- Improve frontend architecture and dashboard design
- Simulate real-world educational software systems

## 🚀 Status
Completed as a learning and demonstration project.

---

**Author:** Osinachi Victor Aluche
