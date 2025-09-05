import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Simple components for testing
const SimpleHome = () => (
  <div>
    <h1>GRRAS Solutions Training Institute</h1>
    <p>Empowering Students with World-Class IT & Cloud Education</p>
  </div>
);

const SimpleCourses = () => (
  <div>
    <h1>Our Training Courses</h1>
    <p>Comprehensive IT training programs designed for career growth</p>
  </div>
);

const SimpleCourseDetail = () => (
  <div>
    <h1>RHCSA - Red Hat Certified System Administrator</h1>
    <p>Complete RHCSA certification training program</p>
  </div>
);

const MinimalServerApp = () => {
  return (
    <div className="App">
      <header>
        <nav>GRRAS Solutions</nav>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<SimpleHome />} />
          <Route path="/courses" element={<SimpleCourses />} />
          <Route path="/courses/:slug" element={<SimpleCourseDetail />} />
        </Routes>
      </main>
    </div>
  );
};

export default MinimalServerApp;