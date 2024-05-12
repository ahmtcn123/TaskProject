import React, { useEffect, useState } from "react";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import { SnackbarProvider, useSnackbar } from "notistack";
import { LinearProgress } from "@mui/material";

import Header from "../components/Header";

import { SERVER_URL } from "../utils";

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ mail?: string; password?: string }>(
    {}
  );
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  useEffect(() => {
    if (localStorage.getItem("token")) {
      setLoading(true);
      enqueueSnackbar("Already logged in, forwarding...", { variant: "info" });
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    }
  }, []);

  const handleEmailChange = (event: any) => {
    setEmail(event.target.value);
  };

  const handlePasswordChange = (event: any) => {
    setPassword(event.target.value);
  };

  const handleSubmit = (event: any) => {
    event.preventDefault();

    // Validate email format
    if (!/\S+@\S+\.\S+/.test(email)) {
      setErrors({ mail: "Invalid email format" });
      return;
    }

    if (password.length < 4) {
      setErrors({ password: "Password must be at least 4 characters long" });
      return;
    }
    setErrors({});
    setLoading(true);

    fetch(`${SERVER_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Invalid email or password");
        }
        return response.json();
      })
      .then((data) => {
        enqueueSnackbar("Login successful, forwarding...", {
          variant: "success",
        });
        localStorage.setItem("token", data.data);
        setTimeout(() => {
          window.location.href = "/";
        }, 2000);
      })
      .catch((error) => {
        enqueueSnackbar(error.message, { variant: "error" });
        setLoading(false);
      });
  };

  return (
    <div>
      <Header />
      <Container style={{ display: "flex", justifyContent: "center" }}>
        <Box
          sx={{
            width: 400,
            borderRadius: 1,
            marginTop: "10vh",
            padding: 5,
            boxShadow: 3,
          }}
        >
          <Typography variant="h4" gutterBottom align="center">
            Login
          </Typography>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="email"
                  label="Email"
                  variant="outlined"
                  value={email}
                  onChange={handleEmailChange}
                  error={!!errors.mail}
                  helperText={errors.mail}
                  disabled={loading}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="password"
                  label="Password"
                  type="password"
                  variant="outlined"
                  value={password}
                  onChange={handlePasswordChange}
                  error={!!errors.password}
                  helperText={errors.password}
                  disabled={loading}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  type="submit"
                  disabled={loading}
                >
                  Login
                </Button>
                <LinearProgress
                  hidden={!loading}
                  style={{ opacity: loading ? 1 : 0 }}
                />
              </Grid>
            </Grid>
          </form>
          <Box mt={2} textAlign="center">
            <a href="/register">Register for an account?</a>
          </Box>
        </Box>
      </Container>
    </div>
  );
}
