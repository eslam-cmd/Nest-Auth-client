"use client";
import { useForm, FieldErrors } from "react-hook-form";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import {
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  Paper,
  Typography,
} from "@mui/material";

type LoginData = {
  email: string;
  password: string;
};

export default function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginData>();

  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [dialog, setDialog] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Axios instance مع credentials
  const api = axios.create({
    baseURL: "https://nest-auth-server-five.vercel.app",
    withCredentials: true,
  });

  // ✅ تحقق عند تحميل الصفحة إذا المستخدم مسجل دخول
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // جرب تجيب بيانات الملف الشخصي
        await api.get("/auth/me");
        router.push("/profile");
      } catch {
        // لو access token انتهى، جرب تجديده
        try {
          await api.post("/auth/refresh");
          await api.get("/auth/me");
          router.push("/profile");
        } catch {
          console.log("User not authenticated, show login form");
        }
      } finally {
        setCheckingAuth(false);
      }
    };
    checkAuth();
  }, [router]);

  // تسجيل الدخول
  const onSubmit = useCallback(
    async (data: LoginData) => {
      setIsLoading(true);
      setDialog(null);

      try {
        await api.post("/auth/login", data);
        setDialog({
          type: "success",
          message: "Login successful! Redirecting...",
        });
        setTimeout(() => router.push("/profile"), 1000);
      } catch (error) {
        const err = error as AxiosError<{ message?: string }>;
        const message = err.response?.data?.message;

        if (message?.includes("بيانات الدخول غير صحيحة")) {
          setDialog({
            type: "error",
            message: "Incorrect email or password",
          });
        } else if (message?.includes("المستخدم غير موجود")) {
          setDialog({
            type: "error",
            message: "No account exists with this email address.",
          });
        } else {
          setDialog({
            type: "error",
            message: "An error occurred, please try again.",
          });
        }
      } finally {
        setIsLoading(false);
      }
    },
    [router]
  );

  // التحقق من الأخطاء في الفورم
  const onError = (errors: FieldErrors<LoginData>) => {
    setDialog({
      type: "error",
      message: "Please fill out the required fields.",
    });
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
        <form onSubmit={handleSubmit(onSubmit, onError)}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 2 }}>
            <TextField
              {...register("email", {
                required: "Email required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Enter a valid email address.",
                },
              })}
              label="Email"
              type="email"
              variant="outlined"
              fullWidth
              error={!!errors.email}
              helperText={errors.email?.message}
              disabled={isLoading}
            />

            <TextField
              {...register("password", {
                required: "Password required",
              })}
              label="Password"
              type="password"
              variant="outlined"
              fullWidth
              error={!!errors.password}
              helperText={errors.password?.message}
              disabled={isLoading}
            />
          </Box>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={isLoading}
            sx={{
              height: 45,
              fontWeight: "bold",
              fontSize: "1rem",
              mt: 1,
            }}
          >
            {isLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Login"
            )}
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
