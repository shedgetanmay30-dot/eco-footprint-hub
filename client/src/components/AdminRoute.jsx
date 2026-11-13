import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AdminRoute = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  return user.role === "admin"
    ? <Outlet />
    : <Navigate to="/dashboard" />;
};

export default AdminRoute;