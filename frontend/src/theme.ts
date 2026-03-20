import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1565c0",
    },
    background: {
      default: "#f5f7fb",
    },
  },
  shape: {
    borderRadius: 16,
  },
  typography: {
    fontFamily: "Arial, Roboto, sans-serif",
    fontSize: 16,
    h4: {
      fontSize: "2rem",
      fontWeight: 700,
    },
    h5: {
      fontSize: "1.5rem",
      fontWeight: 700,
    },
    h6: {
      fontSize: "1.15rem",
      fontWeight: 700,
    },
    button: {
      textTransform: "none",
      fontWeight: 700,
      fontSize: "1rem",
    },
  },
  components: {
    MuiButton: {
      defaultProps: {
        size: "large",
        variant: "contained",
      },
      styleOverrides: {
        root: {
          minHeight: 48,
          paddingLeft: 20,
          paddingRight: 20,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: "0 4px 18px rgba(0,0,0,0.06)",
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        fullWidth: true,
      },
    },
  },
});