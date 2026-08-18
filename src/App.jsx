import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './components/ui/Toast'
import ProtectedRoute from './components/auth/ProtectedRoute'
import DashboardLayout from './layouts/DashboardLayout'

// Public pages
import Splash from './pages/Splash'
import Onboarding from './pages/Onboarding'
import Landing from './pages/Landing'

// Auth pages
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'
import VerifyEmail from './pages/auth/VerifyEmail'
import ResetPassword from './pages/auth/ResetPassword'
import ProfileSetup from './pages/auth/ProfileSetup'

// Dashboard pages
import Dashboard from './pages/dashboard/Dashboard'
import Upload from './pages/upload/Upload'
import Documents from './pages/documents/Documents'
import Chat from './pages/chat/Chat'
import AISummary from './pages/ai/AISummary'
import Flashcards from './pages/ai/Flashcards'
import GenericAIPage from './pages/ai/GenericAIPage'
import Search from './pages/search/Search'
import Profile from './pages/profile/Profile'
import Settings from './pages/settings/Settings'
import Notifications from './pages/notifications/Notifications'

// Error pages
import { NotFound, Unauthorized, Forbidden, ServerError, Maintenance } from './pages/errors/ErrorPages'

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <Routes>
              {/* Entry */}
              <Route path="/" element={<Splash />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/landing" element={<Landing />} />

              {/* Auth */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/profile-setup" element={<ProfileSetup />} />

              {/* Protected dashboard */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="upload" element={<Upload />} />

                {/* Documents */}
                <Route path="documents" element={<Documents title="My Documents" emptyTitle="No documents yet" emptyDesc="Upload your first PDF to get started." />} />
                <Route path="recent" element={<Documents title="Recent Documents" emptyTitle="No recent documents" emptyDesc="Documents you've opened recently will appear here." />} />
                <Route path="favorites" element={<GenericAIPage />} />
                <Route path="shared" element={<GenericAIPage />} />
                <Route path="collections" element={<GenericAIPage />} />
                <Route path="trash" element={<GenericAIPage />} />

                {/* AI tools */}
                <Route path="ai-summary" element={<AISummary />} />
                <Route path="chat" element={<Chat />} />
                <Route path="flashcards" element={<Flashcards />} />
                <Route path="quiz" element={<GenericAIPage />} />
                <Route path="mindmaps" element={<GenericAIPage />} />
                <Route path="notes" element={<GenericAIPage />} />
                <Route path="highlights" element={<GenericAIPage />} />
                <Route path="bookmarks" element={<GenericAIPage />} />
                <Route path="viewer" element={<GenericAIPage />} />

                {/* Search & account */}
                <Route path="search" element={<Search />} />
                <Route path="storage" element={<GenericAIPage />} />
                <Route path="profile" element={<Profile />} />
                <Route path="settings" element={<Settings />} />
                <Route path="billing" element={<GenericAIPage />} />
                <Route path="help" element={<GenericAIPage />} />
                <Route path="notifications" element={<Notifications />} />
              </Route>

              {/* Error pages */}
              <Route path="/401" element={<Unauthorized />} />
              <Route path="/403" element={<Forbidden />} />
              <Route path="/500" element={<ServerError />} />
              <Route path="/maintenance" element={<Maintenance />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default App
