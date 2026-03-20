import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
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
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FolderIcon from "@mui/icons-material/Folder";
import { api } from "../api/client";
import type { ProductListItem } from "../types/product";

type ProductGroup = {
  letter: string;
  items: ProductListItem[];
};

export default function ProductListPage() {
  const navigate = useNavigate();

  const [searchInput, setSearchInput] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expandedLetters, setExpandedLetters] = useState<string[]>([]);

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

  const isMeaningfulValue = (value: unknown) => {
    if (value === null || value === undefined) return false;

    const normalized = String(value).trim().toLowerCase();

    return (
      normalized !== "" &&
      normalized !== "—" &&
      normalized !== "-" &&
      normalized !== "–" &&
      normalized !== "null" &&
      normalized !== "undefined"
    );
  };

  const getLetterKey = (name: string) => {
    const first = name.trim().charAt(0).toUpperCase();

    if (!first) return "#";

    return /[A-ZА-ЯЁ]/i.test(first) ? first : "#";
  };

  const groupedProducts = useMemo<ProductGroup[]>(() => {
    const map = new Map<string, ProductListItem[]>();

    const sortedProducts = [...products].sort((a, b) =>
      a.name.localeCompare(b.name, "ru")
    );

    for (const product of sortedProducts) {
      const letter = getLetterKey(product.name);
      const list = map.get(letter) ?? [];
      list.push(product);
      map.set(letter, list);
    }

    return Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0], "ru"))
      .map(([letter, items]) => ({
        letter,
        items,
      }));
  }, [products]);

  useEffect(() => {
    if (groupedProducts.length === 0) {
      setExpandedLetters([]);
      return;
    }

    if (searchValue) {
      setExpandedLetters(groupedProducts.map((group) => group.letter));
      return;
    }

    setExpandedLetters((prev) => {
      if (prev.length > 0) return prev;
      return [groupedProducts[0].letter];
    });
  }, [groupedProducts, searchValue]);

  const toggleLetter = (letter: string) => {
    setExpandedLetters((prev) =>
      prev.includes(letter)
        ? prev.filter((item) => item !== letter)
        : [...prev, letter]
    );
  };

  const expandAll = () => {
    setExpandedLetters(groupedProducts.map((group) => group.letter));
  };

  const collapseAll = () => {
    setExpandedLetters([]);
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
          <Card sx={{ borderRadius: 4 }}>
            <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
              <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={2}
                justifyContent="space-between"
                alignItems={{ xs: "stretch", md: "center" }}
              >
                <Box>
                  <Typography sx={{ fontSize: 24, fontWeight: 800, mb: 0.5 }}>
                    Алфавитный каталог
                  </Typography>
                  <Typography color="text.secondary">
                    Выберите букву и откройте нужную папку.
                  </Typography>
                </Box>

                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                  <Button variant="outlined" onClick={expandAll}>
                    Раскрыть все
                  </Button>
                  <Button variant="outlined" onClick={collapseAll}>
                    Свернуть все
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "1fr 1fr",
                xl: "1fr 1fr 1fr",
              },
              gap: 2,
              alignItems: "start",
            }}
          >
            {groupedProducts.map((group) => {
  const isExpanded = expandedLetters.includes(group.letter);

  return (
    <Accordion
      key={group.letter}
      expanded={isExpanded}
      onChange={() => toggleLetter(group.letter)}
      disableGutters
      sx={{
        borderRadius: 4,
        overflow: "hidden",
        boxShadow: "0 1px 3px rgba(15, 23, 42, 0.08)",
        border: "1px solid #e6ebf2",
        gridColumn: isExpanded ? "1 / -1" : "auto",
        transition: "all 0.2s ease",
        "&:before": {
          display: "none",
        },
        "&.Mui-expanded": {
          margin: 0,
        },
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{
          px: { xs: 2, md: 3 },
          py: 1,
          backgroundColor: "#f8fbff",
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <FolderIcon sx={{ fontSize: 34, color: "#1565c0" }} />
          <Box>
            <Typography
              sx={{ fontSize: { xs: 22, md: 28 }, fontWeight: 800 }}
            >
              Папка {group.letter}
            </Typography>
            <Typography color="text.secondary">
              Процессов: {group.items.length}
            </Typography>
          </Box>
        </Stack>
      </AccordionSummary>

      <AccordionDetails sx={{ p: { xs: 2, md: 3 } }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "1fr 1fr",
              xl: "1fr 1fr 1fr",
            },
            gap: 2,
            alignItems: "stretch",
          }}
        >
          {group.items.map((product) => {
            const metaItems = [
              { label: "Код", value: product.code },
              { label: "Статус", value: product.status },
              { label: "Подразделение", value: product.departmentName },
              { label: "Количество выхода", value: product.outputQuantity },
            ].filter((item) => isMeaningfulValue(item.value));

            return (
              <Card
                key={product.id}
                sx={{
                  borderRadius: 4,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <CardContent
                  sx={{
                    p: { xs: 3, md: 4 },
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                  }}
                >
                  <Stack spacing={3} sx={{ height: "100%" }}>
                    <Typography
                      variant="h5"
                      sx={{
                        fontSize: { xs: 24, md: 30 },
                        fontWeight: 800,
                        lineHeight: 1.2,
                        minHeight: { xs: "auto", md: 72 },
                        wordBreak: "break-word",
                      }}
                    >
                      {product.name}
                    </Typography>

                    {metaItems.length > 0 && (
                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: "1fr",
                          gap: 1.5,
                        }}
                      >
                        {metaItems.map((item) => (
                          <Box
                            key={item.label}
                            sx={{
                              p: 1.5,
                              borderRadius: 2.5,
                              backgroundColor: "#f8fafc",
                              border: "1px solid #e3e8ef",
                            }}
                          >
                            <Typography
                              sx={{
                                fontSize: 13,
                                color: "text.secondary",
                                mb: 0.25,
                              }}
                            >
                              {item.label}
                            </Typography>
                            <Typography
                              sx={{
                                fontSize: 18,
                                fontWeight: 700,
                                wordBreak: "break-word",
                              }}
                            >
                              {String(item.value)}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    )}

                    <Box sx={{ mt: "auto" }}>
                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={<OpenInNewIcon />}
                        onClick={() => navigate(`/products/${product.id}`)}
                        sx={{
                          minHeight: 60,
                          fontSize: 22,
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
            );
          })}
        </Box>
      </AccordionDetails>
    </Accordion>
  );
})}
          </Box>
        </Stack>
      )}
    </Stack>
  );
}