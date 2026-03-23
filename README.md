# EduTrack - Modern Learning Management System (Frontend)

![Angular](https://img.shields.io/badge/Angular-21-DD0031?style=for-the-badge&logo=angular)
![Bootstrap](https://img.shields.io/badge/Bootstrap-5-7952B3?style=for-the-badge&logo=bootstrap)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**EduTrack** is a responsive, role-based Learning Management System (LMS) built with **Angular 18**. It serves as the frontend for a robust microservices ecosystem, providing a seamless academic experience for Students, Instructors, and Administrators.

---

## 🚀 Key Features

### 👤 User Authentication & Security
* **Role-Based Access Control (RBAC):** Specific views and permissions for `STUDENT`, `INSTRUCTOR`, and `ADMIN`.
* **JWT Integration:** Secure state management using JSON Web Tokens for cross-microservice communication.
* **Auto-Logout & Interceptors:** Functional interceptors to handle `401 Unauthorized` errors and global session expiration.
* **Guarded Routes:** Protection against unauthorized access using Angular Route Guards.

### 🎓 Academic Management
* **Program Discovery:** Browse programs with a hierarchical flow: `Program` → `Course` → `Module` → `Content`.
* **Real-time Enrollment:** Instant checking and one-click enrollment logic.
* **Interactive Classroom:** Integrated viewer for YouTube videos and PDF documents using secure Sanity-checked iframes.

### 🛠️ Admin & Instructor Tools
* **User Management:** Administrative console to manage, approve, or reject user registrations.
* **Curriculum Editor:** Full CRUD capabilities for managing the academic roadmap.
* **Status Tracking:** (In Progress) Progress-tracking logic to unlock advanced assessments.

---

## 💻 Tech Stack

* **Framework:** [Angular 21](https://angular.dev/) (Standalone Components)
* **State Management:** Angular **Signals** for reactive, high-performance UI updates.
* **Styling:** Bootstrap 5 & Bootstrap Icons.
* **Networking:** Functional `HttpClient` Interceptors.
* **Security:** `jwt-decode` for payload parsing and Role-based guards.

---

## 📂 Project Structure

```plaintext
src/app/
├── core/
│   ├── components/      # Global Layout (Sidebar, Navbar)
│   ├── interceptors/    # Auth and Error handling logic
│   ├── guards/          # Route protection (AuthGuard, GuestGuard)
│   ├── models/          # TypeScript interfaces for API responses
│   └── services/        # API logic (Auth, Course, Enrollment, Content)
├── features/
│   ├── auth/            # Login & Multi-role Registration
│   ├── dashboard/       # Role-specific landing pages
│   ├── programs/        # Program discovery and details
│   ├── courses/         # Course management & lists
│   ├── modules/         # Module viewers and editors
│   └── contents/        # Video viewer & PDF materials
└── app.routes.ts        # Centralized routing configuration
