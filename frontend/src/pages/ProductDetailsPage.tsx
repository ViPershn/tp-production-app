import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import FactoryIcon from "@mui/icons-material/Factory";
import { api } from "../api/client";
import type { ProductDetails } from "../types/product";
import ProductionFlow from "../components/ProductionFlow";

export default function ProductDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [product, setProduct] = useState<ProductDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [productionStarted, setProductionStarted] = useState(false);

  const loadProduct = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get<ProductDetails>(`/products/${id}`);
      setProduct(response.data);
    } catch (e) {
      console.error(e);
      setError("Не удалось загрузить карточку процесса.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProduct();
  }, [id]);

  const hasValue = (value: unknown) => {
    return value !== null && value !== undefined && String(value).trim() !== "";
  };

  const formatValue = (value: unknown) => String(value);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!product) {
    return <Alert severity="info">Процесс не найден.</Alert>;
  }

  const productMetaItems = [
    { label: "Код", value: product.code },
    { label: "Статус", value: product.status },
    { label: "Подразделение", value: product.departmentName },
    { label: "Группа", value: product.groupName },
    { label: "Количество выхода", value: product.outputQuantity },
  ].filter((item) => hasValue(item.value));

  return (
    <Stack spacing={3}>
      <Card
        sx={{
          borderRadius: 4,
          overflow: "hidden",
          background: "linear-gradient(135deg, #1296d4 0%, #0b7db2 100%)",
        }}
      >
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={3}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "center" }}
          >
            <Stack spacing={2}>
              <Box>
                <Typography
                  sx={{
                    fontSize: { xs: 28, md: 38 },
                    fontWeight: 800,
                    color: "#fff",
                    lineHeight: 1.1,
                  }}
                >
                  Карточка технологического процесса
                </Typography>

                <Typography
                  sx={{
                    fontSize: { xs: 16, md: 20 },
                    color: "rgba(255,255,255,0.92)",
                    mt: 1,
                  }}
                >
                  Просмотр параметров процесса и запуск режима производства
                </Typography>
              </Box>
            </Stack>

            <Button
              variant="contained"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate("/")}
              sx={{
                minWidth: 240,
                minHeight: 58,
                fontSize: 20,
                fontWeight: 700,
                borderRadius: 3,
                boxShadow: "none",
                backgroundColor: "#ffffff",
                color: "#0b7db2",
                "&:hover": {
                  backgroundColor: "#eef8fd",
                  boxShadow: "none",
                },
              }}
            >
              Назад к списку
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 4 }}>
        <CardContent>
          <Stack spacing={3}>
            <Typography variant="h5" sx={{ fontSize: 32, fontWeight: 700 }}>
              {product.name}
            </Typography>

            {productMetaItems.length > 0 && (
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                  gap: 2,
                }}
              >
                {productMetaItems.map((item, index) => {
                  const isLastOdd =
                    productMetaItems.length % 2 === 1 &&
                    index === productMetaItems.length - 1;

                  return (
                    <Box
                      key={item.label}
                      sx={{
                        p: 2,
                        borderRadius: 3,
                        backgroundColor: "#f8fafc",
                        border: "1px solid #e3e8ef",
                        gridColumn: isLastOdd ? { xs: "auto", md: "1 / span 2" } : "auto",
                      }}
                    >
                      <Typography sx={{ fontSize: 15, color: "text.secondary", mb: 0.5 }}>
                        {item.label}
                      </Typography>
                      <Typography sx={{ fontSize: 22, fontWeight: 700 }}>
                        {formatValue(item.value)}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            )}

            {hasValue(product.productDescription) && (
              <Box
                sx={{
                  p: 3,
                  borderRadius: 3,
                  backgroundColor: "#fff8e1",
                  border: "2px solid #ffe082",
                }}
              >
                <Typography
                  sx={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: "#7a5a00",
                    mb: 1,
                  }}
                >
                  Описание процесса
                </Typography>

                <Typography
                  sx={{
                    fontSize: 22,
                    lineHeight: 1.5,
                    fontWeight: 600,
                    color: "#1f2937",
                  }}
                >
                  {formatValue(product.productDescription)}
                </Typography>
              </Box>
            )}

            <Box>
              {!productionStarted ? (
                <Button
                  startIcon={<FactoryIcon />}
                  size="large"
                  variant="contained"
                  onClick={() => setProductionStarted(true)}
                  sx={{
                    minWidth: 280,
                    minHeight: 64,
                    fontSize: 22,
                    fontWeight: 700,
                    borderRadius: 3,
                    boxShadow: "none",
                  }}
                >
                  Начать производство
                </Button>
              ) : (
                <Button
                  size="large"
                  variant="outlined"
                  onClick={() => setProductionStarted(false)}
                  sx={{
                    minWidth: 320,
                    minHeight: 64,
                    fontSize: 22,
                    fontWeight: 700,
                    borderRadius: 3,
                  }}
                >
                  Скрыть режим производства
                </Button>
              )}
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {productionStarted ? (
        <ProductionFlow
          operations={product.operations}
          onOperationUpdated={loadProduct}
        />
      ) : (
        <Alert severity="info">
          Нажмите «Начать производство», чтобы открыть этапы по очереди и запустить
          таймер.
        </Alert>
      )}
    </Stack>
  );
}