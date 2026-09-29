// import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// import { ThemeProvider } from "./context/ThemeContext";
// import { AuthProvider } from "./context/AuthContext";
// import { SecurityProvider } from "./context/SecurityContext";
// import { ToastProvider } from "./components/ui/Toast";
// import ProtectedRoute from "./components/auth/ProtectedRoute";
// import DashboardLayout from "./layouts/DashboardLayout";

// import { lazy, suspense } from "react";
// // Public pages
// import Splash from "./pages/Splash";
// import Onboarding from "./pages/Onboarding";
// import Landing from "./pages/Landing";
// import AuthCallback from "./pages/AuthCallback";

// // Auth pages
// import Login from "./pages/auth/Login";
// import Register from "./pages/auth/Register";
// import ForgotPassword from "./pages/auth/ForgotPassword";
// import VerifyEmail from "./pages/auth/VerifyEmail";
// import ResetPassword from "./pages/auth/ResetPassword";
// import ProfileSetup from "./pages/auth/ProfileSetup";

// // Dashboard pages
// import Dashboard from "./pages/dashboard/Dashboard";
// import Upload from "./pages/upload/Upload";
// import Documents from "./pages/documents/Documents";
// import Chat from "./pages/chat/Chat";
// import AISummary from "./pages/ai/AISummary";
// import Flashcards from "./pages/ai/Flashcards";
// import GenericAIPage from "./pages/ai/GenericAIPage";
// import Search from "./pages/search/Search";
// import Profile from "./pages/profile/Profile";
// import Settings from "./pages/settings/Settings";
// import Notifications from "./pages/notifications/Notifications";

// // Security pages
// import SecurityFeatures from "./components/SecurityFeatures";

// // Error pages
// import {
//   NotFound,
//   Unauthorized,
//   Forbidden,
//   ServerError,
//   Maintenance,
// } from "./pages/errors/ErrorPages";

// function App() {
//   return (
//     <BrowserRouter>
//       <ThemeProvider>
//         <AuthProvider>
//           <SecurityProvider>
//             <ToastProvider>
//               <Routes>
//                 {/* Entry */}
//                 <Route path="/" element={<Splash />} />
//                 <Route path="/onboarding" element={<Onboarding />} />
//                 <Route path="/landing" element={<Landing />} />

//                 {/* Auth */}
//                 <Route path="/login" element={<Login />} />
//                 <Route path="/register" element={<Register />} />
//                 <Route path="/auth-callback" element={<AuthCallback />} />
//                 <Route path="/forgot-password" element={<ForgotPassword />} />
//                 <Route path="/verify-email" element={<VerifyEmail />} />
//                 <Route path="/reset-password" element={<ResetPassword />} />
//                 <Route path="/profile-setup" element={<ProfileSetup />} />

//                 {/* Protected dashboard */}
//                 <Route
//                   path="/"
//                   element={
//                     <ProtectedRoute>
//                       <DashboardLayout />
//                     </ProtectedRoute>
//                   }
//                 >
//                   <Route path="dashboard" element={<Dashboard />} />
//                   <Route path="upload" element={<Upload />} />

//                   {/* Documents */}
//                   <Route
//                     path="documents"
//                     element={
//                       <Documents
//                         title="My Documents"
//                         emptyTitle="No documents yet"
//                         emptyDesc="Upload your first Document to get started."
//                       />
//                     }
//                   />
//                   <Route
//                     path="recent"
//                     element={
//                       <Documents
//                         title="Recent Documents"
//                         emptyTitle="No recent documents"
//                         emptyDesc="Documents you've opened recently will appear here."
//                       />
//                     }
//                   />
//                   <Route path="favorites" element={<GenericAIPage />} />
//                   <Route path="shared" element={<GenericAIPage />} />
//                   <Route path="collections" element={<GenericAIPage />} />
//                   <Route path="trash" element={<GenericAIPage />} />

//                   {/* AI tools */}
//                   <Route path="ai-summary" element={<AISummary />} />
//                   <Route path="chat" element={<Chat />} />
//                   <Route path="flashcards" element={<Flashcards />} />
//                   <Route path="quiz" element={<GenericAIPage />} />
//                   <Route path="mindmaps" element={<GenericAIPage />} />
//                   <Route path="notes" element={<GenericAIPage />} />
//                   <Route path="highlights" element={<GenericAIPage />} />
//                   <Route path="bookmarks" element={<GenericAIPage />} />
//                   <Route path="viewer" element={<GenericAIPage />} />

//                   {/* Search & account */}
//                   <Route path="search" element={<Search />} />
//                   <Route path="storage" element={<GenericAIPage />} />
//                   <Route path="profile" element={<Profile />} />
//                   <Route path="settings" element={<Settings />} />
//                   <Route path="billing" element={<GenericAIPage />} />
//                   <Route path="help" element={<GenericAIPage />} />
//                   <Route path="notifications" element={<Notifications />} />
//                   <Route path="security" element={<SecurityFeatures />} />
//                 </Route>

//                 {/* Error pages */}
//                 <Route path="/401" element={<Unauthorized />} />
//                 <Route path="/403" element={<Forbidden />} />
//                 <Route path="/500" element={<ServerError />} />
//                 <Route path="/maintenance" element={<Maintenance />} />
//                 <Route path="*" element={<NotFound />} />
//               </Routes>
//             </ToastProvider>
//           </SecurityProvider>
//         </AuthProvider>
//       </ThemeProvider>
//     </BrowserRouter>
//   );
// }

// export default App;

import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { SecurityProvider } from "./context/SecurityContext";
import { ToastProvider } from "./components/ui/Toast";

import ProtectedRoute from "./components/auth/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";

/* =========================================================
   Lazy Loaded Pages
   ========================================================= */

// Public pages
const Splash = lazy(() => import("./pages/Splash"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const Landing = lazy(() => import("./pages/Landing"));
const AuthCallback = lazy(() => import("./pages/AuthCallback"));

// Auth pages
const Login = lazy(() => import("./pages/auth/Login"));
const Register = lazy(() => import("./pages/auth/Register"));
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword"));
const VerifyEmail = lazy(() => import("./pages/auth/VerifyEmail"));
const ResetPassword = lazy(() => import("./pages/auth/ResetPassword"));
const ProfileSetup = lazy(() => import("./pages/auth/ProfileSetup"));

// Dashboard pages
const Dashboard = lazy(() => import("./pages/dashboard/Dashboard"));

const Upload = lazy(() => import("./pages/upload/Upload"));

const Documents = lazy(() => import("./pages/documents/Documents"));

const Chat = lazy(() => import("./pages/chat/Chat"));

const AISummary = lazy(() => import("./pages/ai/AISummary"));

const Flashcards = lazy(() => import("./pages/ai/Flashcards"));

const GenericAIPage = lazy(() => import("./pages/ai/GenericAIPage"));

const Search = lazy(() => import("./pages/search/Search"));

const Profile = lazy(() => import("./pages/profile/Profile"));

const Settings = lazy(() => import("./pages/settings/Settings"));

const Notifications = lazy(() => import("./pages/notifications/Notifications"));

// Security page
const SecurityFeatures = lazy(() => import("./components/SecurityFeatures"));

/* =========================================================
   Error Pages
   ========================================================= */

// Because ErrorPages uses named exports instead of default exports,
// we convert each named export into a default export for React.lazy().

const NotFound = lazy(() =>
  import("./pages/errors/ErrorPages").then((module) => ({
    default: module.NotFound,
  })),
);

const Unauthorized = lazy(() =>
  import("./pages/errors/ErrorPages").then((module) => ({
    default: module.Unauthorized,
  })),
);

const Forbidden = lazy(() =>
  import("./pages/errors/ErrorPages").then((module) => ({
    default: module.Forbidden,
  })),
);

const ServerError = lazy(() =>
  import("./pages/errors/ErrorPages").then((module) => ({
    default: module.ServerError,
  })),
);

const Maintenance = lazy(() =>
  import("./pages/errors/ErrorPages").then((module) => ({
    default: module.Maintenance,
  })),
);

/* =========================================================
   Loading Component
   ========================================================= */

function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-muted border-t-primary" />

        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

/* =========================================================
   App
   ========================================================= */

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <SecurityProvider>
            <ToastProvider>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  {/* =================================================
                      Public / Entry Routes
                     ================================================= */}

                  <Route path="/" element={<Splash />} />

                  <Route path="/onboarding" element={<Onboarding />} />

                  <Route path="/landing" element={<Landing />} />

                  {/* =================================================
                      Authentication Routes
                     ================================================= */}

                  <Route path="/login" element={<Login />} />

                  <Route path="/register" element={<Register />} />

                  <Route path="/auth-callback" element={<AuthCallback />} />
                  <Route path="/shared/:token" element={<GenericAIPage />} />

                  <Route path="/forgot-password" element={<ForgotPassword />} />

                  <Route path="/verify-email" element={<VerifyEmail />} />

                  <Route path="/reset-password" element={<ResetPassword />} />

                  <Route path="/profile-setup" element={<ProfileSetup />} />

                  {/* =================================================
                      Protected Dashboard Routes
                     ================================================= */}

                  <Route
                    path="/"
                    element={
                      <ProtectedRoute>
                        <DashboardLayout />
                      </ProtectedRoute>
                    }
                  >
                    {/* Dashboard */}
                    <Route path="dashboard" element={<Dashboard />} />

                    {/* Upload */}
                    <Route path="upload" element={<Upload />} />

                    {/* =================================================
                        Documents
                       ================================================= */}

                    <Route
                      path="documents"
                      element={
                        <Documents
                          title="My Documents"
                          emptyTitle="No documents yet"
                          emptyDesc="Upload your first Document to get started."
                        />
                      }
                    />

                    <Route
                      path="recent"
                      element={
                        <Documents
                          title="Recent Documents"
                          emptyTitle="No recent documents"
                          emptyDesc="Documents you've opened recently will appear here."
                        />
                      }
                    />

                    <Route path="favorites" element={<GenericAIPage />} />

                    <Route path="shared" element={<GenericAIPage />} />

                    <Route path="collections" element={<GenericAIPage />} />

                    <Route path="trash" element={<GenericAIPage />} />

                    {/* =================================================
                        AI Tools
                       ================================================= */}

                    <Route path="ai-summary" element={<AISummary />} />

                    <Route path="chat" element={<Chat />} />

                    <Route path="flashcards" element={<Flashcards />} />

                    <Route path="quiz" element={<GenericAIPage />} />

                    <Route path="mindmaps" element={<GenericAIPage />} />

                    <Route path="notes" element={<GenericAIPage />} />

                    <Route path="highlights" element={<GenericAIPage />} />

                    <Route path="bookmarks" element={<GenericAIPage />} />

                    <Route path="viewer" element={<GenericAIPage />} />

                    {/* =================================================
                        Search
                       ================================================= */}

                    <Route path="search" element={<Search />} />

                    {/* =================================================
                        Account / Settings
                       ================================================= */}

                    <Route path="storage" element={<GenericAIPage />} />

                    <Route path="profile" element={<Profile />} />

                    <Route path="settings" element={<Settings />} />

                    <Route path="billing" element={<GenericAIPage />} />

                    <Route path="help" element={<GenericAIPage />} />

                    <Route path="notifications" element={<Notifications />} />

                    {/* =================================================
                        Security
                       ================================================= */}

                    <Route path="security" element={<SecurityFeatures />} />
                  </Route>

                  {/* =================================================
                      Error Routes
                     ================================================= */}

                  <Route path="/401" element={<Unauthorized />} />

                  <Route path="/403" element={<Forbidden />} />

                  <Route path="/500" element={<ServerError />} />

                  <Route path="/maintenance" element={<Maintenance />} />

                  {/* =================================================
                      404
                     ================================================= */}

                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </ToastProvider>
          </SecurityProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
