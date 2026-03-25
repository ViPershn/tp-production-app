import { AppBar, Box, Button, Stack, Toolbar, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";

export default function AppHeader() {
  const navigate = useNavigate();
  const { username, logout } = useAuth();

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: "#1296d4",
        borderBottom: "4px solid #0b7db2",
      }}
    >
      <Toolbar
        sx={{
          minHeight: { xs: 72, md: 84 },
          display: "flex",
          gap: 2,
        }}
      >
        <Box
          onClick={() => navigate("/")}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            cursor: "pointer",
          }}
        >
          <Box
            component="img"
            src="/logo.png"
            alt="Макромер"
            sx={{
              width: { xs: 120, md: 160 },
              height: "auto",
              objectFit: "contain",
              backgroundColor: "#fff",
              borderRadius: 2,
              px: 1,
              py: 0.5,
            }}
          />

          <Box sx={{ display: { xs: "none", md: "block" } }}>
            <Typography
              sx={{
                fontSize: 26,
                fontWeight: 800,
                lineHeight: 1.1,
                color: "#fff",
              }}
            >
              Журнал аппаратчика
            </Typography>

            <Typography
              sx={{
                fontSize: 15,
                color: "rgba(255,255,255,0.9)",
                mt: 0.5,
              }}
            >
              Производственный интерфейс
            </Typography>
          </Box>
        </Box>

        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          sx={{ ml: "auto" }}
        >
          <Typography sx={{ color: "#fff", fontWeight: 700 }}>
            {username || "Пользователь"}
          </Typography>

          <Button
            variant="contained"
            onClick={() => void logout()}
            sx={{
              backgroundColor: "#ffffff",
              color: "#0b7db2",
              boxShadow: "none",
              fontWeight: 700,
              "&:hover": {
                backgroundColor: "#eef8fd",
                boxShadow: "none",
              },
            }}
          >
            Выйти
          </Button>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}