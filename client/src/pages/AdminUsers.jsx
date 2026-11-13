
import { useEffect, useState } from "react";
import API from "../services/api";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // LOAD ALL USERS
  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/admin/users");

      const userData =
        response.data.users ||
        response.data ||
        [];

      setUsers(Array.isArray(userData) ? userData : []);
    } catch (err) {
      console.error("Load users error:", err);

      setError(
        err.response?.data?.message ||
        "Unable to load users."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // CHANGE USER ROLE
  const updateRole = async (userId, newRole) => {
    try {
      setUpdatingId(userId);
      setMessage("");
      setError("");

      await API.put(`/admin/users/${userId}/role`, {
        role: newRole
      });

      setMessage("User role updated successfully!");

      await loadUsers();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Failed to update user role."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  // DELETE USER
  const deleteUser = async (userId, userName) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${userName}?`
    );

    if (!confirmed) return;

    try {
      setUpdatingId(userId);
      setMessage("");
      setError("");

      await API.delete(`/admin/users/${userId}`);

      setMessage("User deleted successfully!");

      await loadUsers();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Failed to delete user."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  // SEARCH USERS
  const filteredUsers = users.filter((user) => {
    const searchText = search.toLowerCase();

    return (
      user.name?.toLowerCase().includes(searchText) ||
      user.email?.toLowerCase().includes(searchText) ||
      user.role?.toLowerCase().includes(searchText)
    );
  });

  if (loading) {
    return (
      <div className="container">
        <h2>Loading Users...</h2>
      </div>
    );
  }

  return (
    <div className="container admin-users">

      <h1>Admin User Management 👥</h1>

      <p>
        View, search, manage and control registered users.
      </p>

      {message && (
        <p className="admin-message success-message">
          {message}
        </p>
      )}

      {error && (
        <p className="admin-message error-message">
          {error}
        </p>
      )}

      {/* USER STATISTICS */}
      <div className="dashboard-cards">

        <div className="dashboard-card">
          <h3>Total Users</h3>
          <h2>{users.length}</h2>
        </div>

        <div className="dashboard-card">
          <h3>Regular Users</h3>
          <h2>
            {users.filter(
              (user) => user.role === "user"
            ).length}
          </h2>
        </div>

        <div className="dashboard-card">
          <h3>Administrators</h3>
          <h2>
            {users.filter(
              (user) => user.role === "admin"
            ).length}
          </h2>
        </div>

      </div>

      {/* SEARCH AND REFRESH */}
      <h2>Registered Users</h2>

      <div className="user-controls">

        <input
          type="text"
          placeholder="Search by name, email or role..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <button onClick={loadUsers}>
          Refresh Users 🔄
        </button>

      </div>

      {/* USERS TABLE */}
      {filteredUsers.length > 0 ? (

        <div className="table-container">

          <table>
            <thead>
              <tr>
                <th>Sr. No.</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Points</th>
                <th>Green Score</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.map((user, index) => (

                <tr key={user._id}>
                  <td>{index + 1}</td>

                  <td>{user.name}</td>

                  <td>{user.email}</td>

                  <td>
                    <span className="user-role">
                      {user.role}
                    </span>
                  </td>

                  <td>{user.points ?? 0}</td>

                  <td>{user.greenScore ?? 0}</td>

                  <td>
                    <div className="user-actions">

                      <select
                        value={user.role}
                        disabled={updatingId === user._id}
                        onChange={(e) =>
                          updateRole(
                            user._id,
                            e.target.value
                          )
                        }
                      >
                        <option value="user">
                          User
                        </option>

                        <option value="admin">
                          Admin
                        </option>
                      </select>

                      <button
                        className="delete-btn"
                        disabled={updatingId === user._id}
                        onClick={() =>
                          deleteUser(
                            user._id,
                            user.name
                          )
                        }
                      >
                        {updatingId === user._id
                          ? "Please wait..."
                          : "Delete"}
                      </button>

                    </div>
                  </td>
                </tr>

              ))}
            </tbody>
          </table>

        </div>

      ) : (
        <p>No users found.</p>
      )}

    </div>
  );
};

export default AdminUsers;
