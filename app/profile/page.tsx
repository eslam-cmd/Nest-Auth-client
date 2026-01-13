"use client";
import { useState, useEffect } from "react";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Stack,
} from "@mui/material";

type User = {
  id: string;
  email: string;
  username?: string;
};

export default function ProfilePage() {
  const api = axios.create({
    baseURL: "https://github.com/eslam-cmd/Nest-Auth-server",
    withCredentials: true,
  });

  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [username, setUsername] = useState("");
  const [loadingAction, setLoadingAction] = useState<
    null | "update" | "logout" | "delete"
  >(null);
  const [status, setStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Fetch user profile on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/auth/me");
        setUser(res.data.user || res.data); // safer handling
        setUsername(res.data.user?.username || res.data.username || "");
      } catch (err) {
        console.error("Not logged in", err);
        setStatus({ type: "error", message: "You are not authorized." });
        router.push("/login"); // redirect to login if not authenticated
      }
    };
    fetchUser();
  }, [router]);

  const handleUpdate = async () => {
    if (!username.trim()) {
      setStatus({ type: "error", message: "Username cannot be empty." });
      return;
    }

    setLoadingAction("update");
    setStatus(null);
    try {
      const res = await api.put("/auth/update", { username });
      setStatus({ type: "success", message: "Account updated successfully." });
      setUser(res.data.user || res.data);
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      setStatus({
        type: "error",
        message: error.response?.data?.message || "Failed to update account.",
      });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleLogout = async () => {
    setLoadingAction("logout");
    try {
      await api.post("/auth/logout");
      setUser(null);
      router.push("/login");
    } catch (err) {
      setStatus({ type: "error", message: "Logout failed." });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleDelete = async () => {
    const ok = confirm(
      "Are you sure you want to delete your account? This action cannot be undone."
    );
    if (!ok) return;

    setLoadingAction("delete");
    try {
      await api.delete("/auth/delete");
      setStatus({ type: "success", message: "Account deleted successfully." });
      setUser(null);
      router.push("/");
    } catch (err) {
      setStatus({ type: "error", message: "Failed to delete account." });
    } finally {
      setLoadingAction(null);
    }
  };

  if (!user) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
        {status ? (
          <Alert severity="error">{status.message}</Alert>
        ) : (
          <CircularProgress />
        )}
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 480, mx: "auto", mt: 6 }}>
      <Paper sx={{ p: 4 }} elevation={3}>
        <Typography variant="h5" gutterBottom>
          My Account
        </Typography>

        {status && (
          <Alert
            severity={status.type}
            sx={{ mb: 2 }}
            onClose={() => setStatus(null)}
          >
            {status.message}
          </Alert>
        )}

        <Typography variant="body2" sx={{ mb: 1 }}>
          <strong>Email:</strong> {user.email}
        </Typography>

        <TextField
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          fullWidth
          sx={{ mt: 2, mb: 2 }}
          disabled={loadingAction === "update"}
        />

        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleUpdate}
            disabled={loadingAction === "update"}
          >
            {loadingAction === "update" ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              "Save Changes"
            )}
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleLogout}
            style={{fontSize:"12px"}}
            disabled={loadingAction === "logout"}
          >
            {loadingAction === "logout" ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              "Logout"
            )}
          </Button>
          <Button
            variant="text"
            color="error"
            onClick={handleDelete}
            disabled={loadingAction === "delete"}
          >
            {loadingAction === "delete" ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              "Delete Account"
            )}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
