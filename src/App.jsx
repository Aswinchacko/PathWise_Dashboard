import { Routes, Route, Navigate } from 'react-router-dom'
import { useState } from 'react'
import Layout from './components/Layout/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Dashboard from './pages/Dashboard'
import Roadmap from './pages/Roadmap'
import Projects from './pages/Projects'
import Mentors from './pages/Mentors'
import Jobs from './pages/Jobs'
import MicroLearning from './pages/MicroLearning'
import Chatbot from './pages/Chatbot'
import Resources from './pages/Resources'
import Community from './pages/Community'
import Settings from './pages/Settings'
import ResumeParser from './pages/ResumeParser'
import AdminDashboard from './pages/AdminDashboard'
import Login from './pages/Login'
import Register from './pages/Register'
import GitHubCallback from './pages/GitHubCallback'
import LinkedInCallback from './pages/LinkedInCallback'
import SubscriptionSuccess from './pages/SubscriptionSuccess'
import SubscriptionCancel from './pages/SubscriptionCancel'
import Subscription from './pages/Subscription'
import PlanGate from './components/PlanGate/PlanGate'

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <Routes>
      {/* Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/auth/github/callback" element={<GitHubCallback />} />
      <Route path="/auth/linkedin/callback" element={<LinkedInCallback />} />
      <Route path="/subscription/success" element={<SubscriptionSuccess />} />
      <Route path="/subscription/cancel" element={<SubscriptionCancel />} />

      {/* Protected Main Routes */}
      <Route path="/" element={
        <ProtectedRoute>
          <Layout sidebarCollapsed={sidebarCollapsed} setSidebarCollapsed={setSidebarCollapsed}>
            <Dashboard />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Layout sidebarCollapsed={sidebarCollapsed} setSidebarCollapsed={setSidebarCollapsed}>
            <Dashboard />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/roadmap" element={
        <ProtectedRoute>
          <Layout sidebarCollapsed={sidebarCollapsed} setSidebarCollapsed={setSidebarCollapsed}>
            <Roadmap />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/projects" element={
        <ProtectedRoute>
          <Layout sidebarCollapsed={sidebarCollapsed} setSidebarCollapsed={setSidebarCollapsed}>
            <PlanGate feature="projects">
              <Projects />
            </PlanGate>
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/mentors" element={
        <ProtectedRoute>
          <Layout sidebarCollapsed={sidebarCollapsed} setSidebarCollapsed={setSidebarCollapsed}>
            <PlanGate feature="mentors">
              <Mentors />
            </PlanGate>
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/jobs" element={
        <ProtectedRoute>
          <Layout sidebarCollapsed={sidebarCollapsed} setSidebarCollapsed={setSidebarCollapsed}>
            <PlanGate feature="jobs">
              <Jobs />
            </PlanGate>
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/micro-learning" element={
        <ProtectedRoute>
          <Layout sidebarCollapsed={sidebarCollapsed} setSidebarCollapsed={setSidebarCollapsed}>
            <PlanGate feature="micro-learning">
              <MicroLearning />
            </PlanGate>
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/chatbot" element={
        <ProtectedRoute>
          <Layout sidebarCollapsed={sidebarCollapsed} setSidebarCollapsed={setSidebarCollapsed}>
            <Chatbot />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/resources" element={
        <ProtectedRoute>
          <Layout sidebarCollapsed={sidebarCollapsed} setSidebarCollapsed={setSidebarCollapsed}>
            <Resources />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/community" element={
        <ProtectedRoute>
          <Layout sidebarCollapsed={sidebarCollapsed} setSidebarCollapsed={setSidebarCollapsed}>
            <Community />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/subscription" element={
        <ProtectedRoute>
          <Layout sidebarCollapsed={sidebarCollapsed} setSidebarCollapsed={setSidebarCollapsed}>
            <Subscription />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/settings" element={
        <ProtectedRoute>
          <Layout sidebarCollapsed={sidebarCollapsed} setSidebarCollapsed={setSidebarCollapsed}>
            <Settings />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/settings/*" element={
        <ProtectedRoute>
          <Layout sidebarCollapsed={sidebarCollapsed} setSidebarCollapsed={setSidebarCollapsed}>
            <Settings />
          </Layout>
        </ProtectedRoute>
      } />

      {/* Tolerate trailing slash / prefixed path */}
      <Route path="/settings/" element={
        <ProtectedRoute>
          <Layout sidebarCollapsed={sidebarCollapsed} setSidebarCollapsed={setSidebarCollapsed}>
            <Settings />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/dashboard/settings" element={
        <ProtectedRoute>
          <Layout sidebarCollapsed={sidebarCollapsed} setSidebarCollapsed={setSidebarCollapsed}>
            <Settings />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/dashboard/settings/*" element={
        <ProtectedRoute>
          <Layout sidebarCollapsed={sidebarCollapsed} setSidebarCollapsed={setSidebarCollapsed}>
            <Settings />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/resume-parser" element={
        <ProtectedRoute>
          <Layout sidebarCollapsed={sidebarCollapsed} setSidebarCollapsed={setSidebarCollapsed}>
            <ResumeParser />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/admin" element={
        <ProtectedRoute>
          <Layout sidebarCollapsed={sidebarCollapsed} setSidebarCollapsed={setSidebarCollapsed}>
            <AdminDashboard />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/admin/users" element={
        <ProtectedRoute>
          <Layout sidebarCollapsed={sidebarCollapsed} setSidebarCollapsed={setSidebarCollapsed}>
            <AdminDashboard />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/admin/system" element={
        <ProtectedRoute>
          <Layout sidebarCollapsed={sidebarCollapsed} setSidebarCollapsed={setSidebarCollapsed}>
            <AdminDashboard />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/admin/activity" element={
        <ProtectedRoute>
          <Layout sidebarCollapsed={sidebarCollapsed} setSidebarCollapsed={setSidebarCollapsed}>
            <AdminDashboard />
          </Layout>
        </ProtectedRoute>
      } />

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default App