import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import PublicLayout from "./layouts/PublicLayout";
import RoleProtectedRoute from "./components/RoleProtectedRoute";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./components/AppLayout";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import CreateUser from "./pages/CreateUser";
import EditUser from "./pages/EditUser";
import AdminPropertyManagement from "./pages/AdminPropertyManagement";

import AllListings from "./pages/AllListings";
import AddProperty from "./pages/AddProperty";
import MyProperties from "./pages/MyProperties";
import EditProperty from "./pages/EditProperty";
import ViewProperty from "./pages/ViewProperty";
import Wishlist from "./pages/Wishlist";
import OwnerInquiries from "./pages/OwnerInquiries";
import OwnerVisits from "./pages/OwnerVisits";
import ScheduleVisit from "./pages/ScheduleVisit";
import ChatPage from "./pages/ChatPage";
import MyChats from "./pages/MyChats";
import PropertyAnalytics from "./pages/PropertyAnalytics";

import MyProfile from "./pages/MyProfile";
import ChangePassword from "./pages/ChangePassword";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AdminReviewApproval from "./admin/AdminReviewApproval";
import BoostProperty from "./pages/BoostProperty";

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />

      <Routes>
        {/* PUBLIC ROUTES */}
        <Route
          path="/"
          element={
            <PublicLayout>
              <Home />
            </PublicLayout>
          }
        />

        <Route
          path="/listings"
          element={
            <PublicLayout>
              <AllListings />
            </PublicLayout>
          }
        />

        <Route
          path="/property/view/:id"
          element={
            <PublicLayout>
              <ViewProperty />
            </PublicLayout>
          }
        />

        <Route
          path="/schedule-visit/:propertyId"
          element={
            <RoleProtectedRoute allowedRoles={["USER"]}>
              <PublicLayout>
                <ScheduleVisit />
              </PublicLayout>
            </RoleProtectedRoute>
          }
        />
        <Route
          path="/chat/:conversationId"
          element={
            <RoleProtectedRoute allowedRoles={["USER"]}>
              <PublicLayout>
                <ChatPage />
              </PublicLayout>
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/my-chats"
          element={
            <RoleProtectedRoute allowedRoles={["USER"]}>
              <PublicLayout>
                <MyChats />
              </PublicLayout>
            </RoleProtectedRoute>
          }
        />

        {/* AUTH ROUTES */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ADMIN / SUB-ADMIN ROUTES */}
        <Route
          path="/dashboard"
          element={
            <RoleProtectedRoute allowedRoles={["ADMIN", "SUB_ADMIN"]}>
              <Dashboard />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/users"
          element={
            <RoleProtectedRoute allowedRoles={["ADMIN", "SUB_ADMIN"]}>
              <Users />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/create-user"
          element={
            <RoleProtectedRoute allowedRoles={["ADMIN", "SUB_ADMIN"]}>
              <CreateUser />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/edit-user/:id"
          element={
            <RoleProtectedRoute allowedRoles={["ADMIN", "SUB_ADMIN"]}>
              <EditUser />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/admin/properties"
          element={
            <RoleProtectedRoute allowedRoles={["ADMIN", "SUB_ADMIN"]}>
              <AdminPropertyManagement />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/admin/reviews"
          element={
            <RoleProtectedRoute allowedRoles={["ADMIN", "SUB_ADMIN"]}>
              <AppLayout>
                <AdminReviewApproval />
              </AppLayout>
            </RoleProtectedRoute>
          }
        />

        {/* NORMAL USER ROUTES */}
        <Route
          path="/add-property"
          element={
            <RoleProtectedRoute allowedRoles={["USER"]}>
              <PublicLayout>
                <AddProperty />
              </PublicLayout>
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/my-properties"
          element={
            <RoleProtectedRoute allowedRoles={["USER"]}>
              <PublicLayout>
                <MyProperties />
              </PublicLayout>
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/property/analytics/:id"
          element={
            <ProtectedRoute>
              <PropertyAnalytics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/property/boost/:id"
          element={
            <ProtectedRoute>
              <BoostProperty />
            </ProtectedRoute>
          }
        />

        <Route
          path="/edit-property/:id"
          element={
            <RoleProtectedRoute allowedRoles={["USER"]}>
              <PublicLayout>
                <EditProperty />
              </PublicLayout>
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/wishlist"
          element={
            <RoleProtectedRoute allowedRoles={["USER"]}>
              <PublicLayout>
                <Wishlist />
              </PublicLayout>
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/my-inquiries"
          element={
            <RoleProtectedRoute allowedRoles={["USER"]}>
              <PublicLayout>
                <OwnerInquiries />
              </PublicLayout>
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/my-visits"
          element={
            <RoleProtectedRoute allowedRoles={["USER"]}>
              <PublicLayout>
                <OwnerVisits />
              </PublicLayout>
            </RoleProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <RoleProtectedRoute allowedRoles={["USER", "ADMIN", "SUB_ADMIN"]}>
              <PublicLayout>
                <MyProfile />
              </PublicLayout>
            </RoleProtectedRoute>
          }
        />

        {/* OLD OWNER ROUTES REDIRECT */}
        <Route path="/owner-dashboard" element={<Navigate to="/" replace />} />
        <Route
          path="/owner/add-property"
          element={<Navigate to="/add-property" replace />}
        />
        <Route
          path="/owner/my-properties"
          element={<Navigate to="/my-properties" replace />}
        />
        <Route
          path="/owner/edit-property/:id"
          element={<Navigate to="/edit-property/:id" replace />}
        />
        <Route
          path="/owner/all-listings"
          element={<Navigate to="/listings" replace />}
        />
        <Route
          path="/owner/inquiries"
          element={<Navigate to="/my-inquiries" replace />}
        />
        <Route
          path="/owner/visits"
          element={<Navigate to="/my-visits" replace />}
        />

        {/* PASSWORD ROUTES */}

        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route
          path="/change-password"
          element={
            <RoleProtectedRoute allowedRoles={["USER", "ADMIN", "SUB_ADMIN"]}>
              <PublicLayout>
                <ChangePassword />
              </PublicLayout>
            </RoleProtectedRoute>
          }
        />

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
