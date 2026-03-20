import { Box, Container } from "@mui/material";
import { Route, Routes } from "react-router-dom";
import ProductListPage from "./pages/ProductListPage";
import ProductDetailsPage from "./pages/ProductDetailsPage";
import AppHeader from "./components/AppHeader";

export default function App() {
  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#f5f7fb" }}>
      <AppHeader />

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Routes>
          <Route path="/" element={<ProductListPage />} />
          <Route path="/products/:id" element={<ProductDetailsPage />} />
        </Routes>
      </Container>
    </Box>
  );
}