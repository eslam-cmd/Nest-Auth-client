"use client";
import { useForm, FieldErrors } from "react-hook-form";
import axios, { AxiosError } from "axios";
import { useState, useEffect, useCallback } from "react";
import {
  TextField,
  Button,
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useRouter } from "next/navigation";

type RegisterData = {
  email: string;
  password: string;
  username: string;
};

export default function RegisterForm() {
  const api = axios.create({
    baseURL: "https://nest-auth-server-five.vercel.app",
    withCredentials: true,
  });

  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterData>();

  const [dialog, setDialog] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // ✅ تحقق عند تحميل الصفحة إذا المستخدم مسجل دخول
  useEffect(() => {
    const checkAuth = async () => {
      try {
        await api.get("/auth/me");
        router.push("/profile");
      } catch {
        console.log("User not authenticated, show register form");
      } finally {
        setCheckingAuth(false);
      }
    };
    checkAuth();
  }, [router]);

  const onSubmit = useCallback(
    async (data: RegisterData) => {
      setLoading(true);
      setDialog(null);

      try {
        await api.post("/auth/register", data);
        setDialog({
          type: "success",
          message: "Registration successful! You are being redirected to your profile..."
        });
        setTimeout(() => router.push("/profile"), 1000);
      } catch (error) {
        const err = error as AxiosError<{ message?: string }>;
        const message = err.response?.data?.message;

        if (message?.includes("Email already exists")) {
          setDialog({
            type: "error",
            message: "This email address is already registered. Please log in..",
          });
        } else {
          setDialog({
            type: "error",
            message: "An error occurred during registration. Please try again.",
          });
        }
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  const onError = (errors: FieldErrors<RegisterData>) => {
    setDialog({ type: "error", message: "Please fill in all required fields." });
  };

  if (checkingAuth) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="50vh"
    >
      <Paper
        elevation={3}
        sx={{ p: 4, borderRadius: 3, width: 350, textAlign: "center" }}
      >
        <form
          onSubmit={handleSubmit(onSubmit, onError)}
          style={{ display: "flex", flexDirection: "column", gap: "20px" }}
        >
          <TextField
            {...register("username", { required: "Username is required" })}
            label="Username"
            type="text"
            autoComplete="username"
            variant="outlined"
            fullWidth
            error={!!errors.username}
            helperText={errors.username?.message}
            disabled={loading}
          />

          <TextField
            {...register("email", {
              required: "Email required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Enter a valid email address",
              },
            })}
            label="Email"
            type="email"
            autoComplete="email"
            variant="outlined"
            fullWidth
            error={!!errors.email}
            helperText={errors.email?.message}
            disabled={loading}
          />

          <TextField
            {...register("password", { required: "Password is required" })}
            label="Password"
            type="password"
            autoComplete="new-password"
            variant="outlined"
            fullWidth
            error={!!errors.password}
            helperText={errors.password?.message}
            disabled={loading}
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} color="inherit" /> : "Login"}
          </Button>
        </form>

        {dialog && (
          <Alert
            severity={dialog.type}
            sx={{ mt: 2 }}
            onClose={() => setDialog(null)}
          >
            {dialog.message}
          </Alert>
        )}
      </Paper>
    </Box>
  );
}
