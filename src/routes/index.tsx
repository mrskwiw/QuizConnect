import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { AuthLayout } from '../layouts/AuthLayout';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

// Lazy-loaded components
const Home = lazy(() => import('../pages/Home'));
const Login = lazy(() => import('../pages/auth/Login'));
const Register = lazy(() => import('../pages/auth/Register'));
const ForgotPassword = lazy(() => import('../pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('../pages/auth/ResetPassword'));
const PendingVerification = lazy(() => import('../pages/auth/PendingVerification'));
const Dashboard = lazy(() => import('../pages/Dashboard'));
const CreateQuiz = lazy(() => import('../pages/quizzes/CreateQuiz'));
const BrowseQuizzes = lazy(() => import('../pages/quizzes/BrowseQuizzes'));
const QuizDetails = lazy(() => import('../pages/quizzes/QuizDetails'));
const TakeQuiz = lazy(() => import('../pages/quizzes/TakeQuiz'));
const TemplateLibrary = lazy(() => import('../pages/templates/TemplateLibrary'));
const Profile = lazy(() => import('../pages/profile/Profile'));
const UserProfile = lazy(() => import('../pages/profile/UserProfile'));
const EditProfile = lazy(() => import('../pages/profile/EditProfile'));
const Pricing = lazy(() => import('../pages/subscription/Pricing'));
const Feed = lazy(() => import('../pages/Feed'));
const Leaderboard = lazy(() => import('../pages/Leaderboard'));
const NotFound = lazy(() => import('../pages/NotFound'));
const UserManagement = lazy(() => import('../pages/admin/UserManagement'));

export const AppRoutes = () => {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><LoadingSpinner size="lg" /></div>}>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="browse" element={<BrowseQuizzes />} />
          <Route path="quiz/:id" element={<QuizDetails />} />
          <Route path="templates" element={<TemplateLibrary />} />
          <Route path="pricing" element={<Pricing />} />
          <Route path="leaderboard" element={<Leaderboard />} />
          
          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="feed" element={<Feed />} />
            <Route path="create-quiz" element={<CreateQuiz />} />
            <Route path="take-quiz/:id" element={<TakeQuiz />} />
            <Route path="profile/:username" element={<UserProfile />} />
            <Route path="profile/me" element={<Profile />} />
            <Route path="profile/edit" element={<EditProfile />} />
            <Route path="admin/user-management" element={<UserManagement />} />
          </Route>
        </Route>

        {/* Auth routes */}
        <Route element={<AuthLayout />}>
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="reset-password" element={<ResetPassword />} />
          <Route path="pending-verification" element={<PendingVerification />} />
        </Route>

        {/* Fallback routes */}
        <Route path="404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </Suspense>
  );
};