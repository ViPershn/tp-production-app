import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { api } from "../api/client";
import type { ProductListItem } from "../types/product";

export default function ProductListPage() {
  const navigate = useNavigate();

  const [searchInput, setSearchInput] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadProducts = async (value?: string) => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get<ProductListItem[]>("/products", {
        params: value ? { search: value } : {},
      });

      setProducts(response.data);
    } catch (e) {
      console.error(e);
      setError("Не удалось загрузить список процессов.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts(searchValue);
  }, [searchValue]);

  const handleSearch = () => {
    setSearchValue(searchInput.trim());
  };

  const formatValue = (value: unknown) => {
    if (value === null || value === undefined || value === "") return "—";
    return String(value);
  };

  return (
    <Stack spacing={3}>
      <Card
        sx={{
          overflow: "hidden",
          borderRadius: 4,
        }}
      >
        <CardContent sx={{ p: { xs: 3, md: 5 } }}>
          <Stack
            spacing={3}
            alignItems="center"
            justifyContent="center"
            sx={{ textAlign: "center" }}
          >

            <Box>
              <Typography
                variant="h4"
                gutterBottom
                sx={{ fontSize: { xs: 28, md: 38 }, fontWeight: 800 }}
              >
                Реестр технологических процессов
              </Typography>

              <Typography
                color="text.secondary"
                sx={{ fontSize: { xs: 18, md: 22 } }}
              >
                Найдите нужный процесс и откройте его карточку.
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 4 }}>
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <Stack spacing={3}>
            <Typography variant="h5" sx={{ fontSize: 30, fontWeight: 800 }}>
              Поиск процесса
            </Typography>

            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <TextField
                label="Название продукта"
                placeholder="Например: Лапрол, Макромер, ПенеСплитСил"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch();
                }}
                sx={{
                  "& .MuiInputBase-root": {
                    minHeight: 68,
                    fontSize: 22,
                    borderRadius: 3,
                  },
                  "& .MuiInputLabel-root": {
                    fontSize: 18,
                  },
                }}
              />

              <Button
                variant="contained"
                startIcon={<SearchIcon />}
                onClick={handleSearch}
                sx={{
                  minWidth: 240,
                  minHeight: 68,
                  fontSize: 24,
                  fontWeight: 800,
                  borderRadius: 3,
                  boxShadow: "none",
                }}
              >
                Найти
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {error && <Alert severity="error">{error}</Alert>}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
          <CircularProgress />
        </Box>
      ) : products.length === 0 ? (
        <Alert severity="info">Ничего не найдено.</Alert>
      ) : (
        <Stack spacing={2}>
          {products.map((product) => (
            <Card key={product.id} sx={{ borderRadius: 4 }}>
              <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                <Stack spacing={3}>
                  <Typography
                    variant="h5"
                    sx={{ fontSize: { xs: 28, md: 34 }, fontWeight: 800 }}
                  >
                    {product.name}
                  </Typography>

                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                      gap: 2,
                    }}
                  >
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 3,
                        backgroundColor: "#f8fafc",
                        border: "1px solid #e3e8ef",
                      }}
                    >
                      <Typography
                        sx={{ fontSize: 15, color: "text.secondary", mb: 0.5 }}
                      >
                        Код
                      </Typography>
                      <Typography sx={{ fontSize: 24, fontWeight: 800 }}>
                        {formatValue(product.code)}
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 3,
                        backgroundColor: "#f8fafc",
                        border: "1px solid #e3e8ef",
                      }}
                    >
                      <Typography
                        sx={{ fontSize: 15, color: "text.secondary", mb: 0.5 }}
                      >
                        Статус
                      </Typography>
                      <Typography sx={{ fontSize: 24, fontWeight: 800 }}>
                        {formatValue(product.status)}
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 3,
                        backgroundColor: "#f8fafc",
                        border: "1px solid #e3e8ef",
                      }}
                    >
                      <Typography
                        sx={{ fontSize: 15, color: "text.secondary", mb: 0.5 }}
                      >
                        Подразделение
                      </Typography>
                      <Typography sx={{ fontSize: 24, fontWeight: 800 }}>
                        {formatValue(product.departmentName)}
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 3,
                        backgroundColor: "#f8fafc",
                        border: "1px solid #e3e8ef",
                      }}
                    >
                      <Typography
                        sx={{ fontSize: 15, color: "text.secondary", mb: 0.5 }}
                      >
                        Количество выхода
                      </Typography>
                      <Typography sx={{ fontSize: 24, fontWeight: 800 }}>
                        {formatValue(product.outputQuantity)}
                      </Typography>
                    </Box>
                  </Box>

                  <Box>
                    <Button
                      variant="contained"
                      startIcon={<OpenInNewIcon />}
                      onClick={() => navigate(`/products/${product.id}`)}
                      sx={{
                        minWidth: 300,
                        minHeight: 68,
                        fontSize: 24,
                        fontWeight: 800,
                        borderRadius: 3,
                        boxShadow: "none",
                      }}
                    >
                      Открыть процесс
                    </Button>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Stack>
  );
}