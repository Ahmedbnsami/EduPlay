# 🎓 EduPlay

<div align="center">

### Transform Educational Content Into Interactive Learning Experiences

Upload educational material, customize the learning experience, and let AI turn traditional study resources into engaging and interactive content.

Built with React, Vite, and modern frontend technologies.

</div>

---

## 📖 About

EduPlay is a frontend application designed to make learning more engaging and interactive.

Students can upload educational materials, provide custom instructions, track AI processing in real time, and receive generated learning content through a streamlined and intuitive user experience.

The goal is simple: make studying feel less like a task and more like an experience.

---

## ✨ Features

### 🔐 Authentication

* User login and registration interface
* Secure authentication flow
* Session management

### 📁 File Upload System

* Drag-and-drop file upload
* File validation
* Clean upload experience
* Visual feedback during submission

### 🤖 AI Processing Workflow

* Step-by-step processing visualization
* Real-time status updates
* Interactive progress tracking

### 📝 Custom Instructions

* Allow users to provide learning preferences
* Customize generated content
* Tailor the educational experience

### 📊 Results Interface

* Display generated learning content
* Organized and readable output
* Focused user experience

### 📱 Responsive Design

* Desktop support
* Tablet support
* Mobile-friendly layout

---

## 🚀 User Flow

```text
Authentication
      │
      ▼
Upload Study Material
      │
      ▼
Add Custom Instructions
      │
      ▼
Submit For Processing
      │
      ▼
Track Progress
      │
      ▼
View Results
      │
      ▼
Start Learning
```

---

## 🏗️ Project Structure

```text
EduPlay/
├── public/
│
├── src/
│   ├── components/
│   │   ├── AuthView.jsx
│   │   ├── FileUploadDropzone.jsx
│   │   ├── Footer.jsx
│   │   ├── Header.jsx
│   │   ├── ProcessingView.jsx
│   │   ├── ProgressStepper.jsx
│   │   ├── PromptBox.jsx
│   │   ├── ResultsView.jsx
│   │   └── StartButton.jsx
│   │
│   ├── services/
│   │   └── api.js
│   │
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
│
├── .env
├── package.json
├── vite.config.js
└── README.md
```

---

## 🧩 Components

### Header

Provides navigation and application branding.

### AuthView

Handles user authentication interfaces including login and registration.

### FileUploadDropzone

Provides drag-and-drop file uploading with validation and user feedback.

### PromptBox

Allows users to provide custom instructions for content generation.

### ProgressStepper

Displays the current stage of the processing workflow.

### ProcessingView

Shows processing status and progress updates.

### ResultsView

Displays generated educational content and final results.

### Footer

Contains additional information and navigation links.

---

## 🛠️ Tech Stack

| Technology | Purpose           |
| ---------- | ----------------- |
| React      | User Interface    |
| Vite       | Build Tool        |
| JavaScript | Application Logic |
| CSS        | Styling           |
| Axios      | API Communication |

---

## ⚙️ Getting Started

### Clone the Repository

```bash
git clone https://github.com/your-username/eduplay.git
cd eduplay
```

### Install Dependencies

```bash
npm install
```

### Configure Environment Variables

Create a `.env` file:

```env
VITE_API_URL=http://localhost:5000
```

### Start Development Server

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

---

## 🔗 Backend Integration

The frontend communicates with a separate backend service responsible for:

* Authentication
* File processing
* AI content generation
* User management
* Data persistence

API communication is handled through the `services/api.js` module.

---

## 🎯 Project Goals

* Make learning more engaging
* Improve knowledge retention
* Simplify access to AI-powered educational tools
* Deliver a clean and intuitive user experience
* Bridge the gap between education and technology

---

## 👨‍💻 Development

### Frontend

Ahmed Sami

React • Vite • JavaScript • UI Development

### Backend

Developed by another team member

---

<div align="center">

### Learn Better. Study Smarter.

**EduPlay**

</div>
