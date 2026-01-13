"use client";
import { useState } from "react";
import LoginForm from "./auth/login/page";
import RegisterForm from "./auth/register/page";
import {
  Box,
  Button,
  Paper,
  Typography,
  useTheme,
  useMediaQuery,
  Avatar,
} from "@mui/material";
import { LockOutlined, PersonAddOutlined } from "@mui/icons-material";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f8f9fa",
        padding: 2,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          padding: isMobile ? 3 : 4,
          width: "100%",
          maxWidth: 450,
          borderRadius: 2,
          backgroundColor: "white",
        }}
      >
        {/* الرأس */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginBottom: 4,
          }}
        >
          <Avatar
            sx={{
              width: 60,
              height: 60,
              marginBottom: 2,
              backgroundColor: theme.palette.primary.main,
            }}
          >
            {isLogin ? (
              <LockOutlined sx={{ fontSize: 28 }} />
            ) : (
              <PersonAddOutlined sx={{ fontSize: 28 }} />
            )}
          </Avatar>

          <Typography
            variant="h5"
            component="h1"
            fontWeight="600"
            color="text.primary"
            gutterBottom
          >
            {isLogin ? "Login" : "Creavte new account"}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            textAlign="center"
            sx={{ maxWidth: "90%" }}
          >
            {isLogin
              ? "Enter your account details to access the services"
              : "Fill in the following information to create a new account"}
          </Typography>
        </Box>

        {/* النموذج */}
        {isLogin ? <LoginForm /> : <RegisterForm />}

        {/* زر التبديل */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginTop: 3,
            paddingTop: 3,
            borderTop: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
            {isLogin ? "Don't have an account?" : "Already have an account?"}
          </Typography>
          <Button
            onClick={() => setIsLogin(!isLogin)}
            variant="text"
            color="primary"
            size="small"
          >
            {isLogin ? "Signup" : "Login"}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
