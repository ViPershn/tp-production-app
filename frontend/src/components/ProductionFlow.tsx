import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  LinearProgress,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import { api } from "../api/client";
import type { Operation, UpdateOperationRequest } from "../types/product";

type Props = {
  operations: Operation[];
  onOperationUpdated?: () => void | Promise<void>;
};

export default function ProductionFlow({
  operations,
  onOperationUpdated,
}: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [editorEnabled, setEditorEnabled] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState("");

  const currentOperation = operations[currentIndex] ?? null;
  const totalStages = operations.length;
  const progressValue =
    totalStages === 0 ? 0 : Math.round((completedCount / totalStages) * 100);

  const [form, setForm] = useState<UpdateOperationRequest>({
    pressureValue: null,
    pressureUnit: "bar",
    temperatureValue: null,
    temperatureUnit: "C",
    operationDescription: "",
    changedBy: "Оператор",
    changeReason: "Ручное уточнение параметров",
  });

  useEffect(() => {
    if (operations.length === 0) return;

    setCurrentIndex(0);
    setCompletedCount(0);
    setIsRunning(false);
    setConfirmOpen(false);
    setEditorEnabled(false);
    setSaveError("");

    const firstSeconds = Math.round((operations[0].pieceTimeMinutes ?? 0) * 60);
    setRemainingSeconds(firstSeconds);
  }, [operations]);

  useEffect(() => {
    if (!currentOperation) return;

    setForm({
      pressureValue: currentOperation.pressureValue ?? null,
      pressureUnit: currentOperation.pressureUnit ?? "bar",
      temperatureValue: currentOperation.temperatureValue ?? null,
      temperatureUnit: currentOperation.temperatureUnit ?? "C",
      operationDescription: currentOperation.operationDescription ?? "",
      changedBy: "Оператор",
      changeReason: "Ручное уточнение параметров",
    });
  }, [currentOperation]);

  useEffect(() => {
    if (!isRunning) return;

    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning]);

  const currentStageSeconds = useMemo(() => {
    if (!currentOperation?.pieceTimeMinutes) return 0;
    return Math.round(currentOperation.pieceTimeMinutes * 60);
  }, [currentOperation]);

  const formatValue = (value: unknown) => {
    if (value === null || value === undefined || value === "") return "—";
    return String(value);
  };

  const formatParam = (value: number | null, unit: string | null) => {
    if (value === null || value === undefined) return "—";
    return `${value} ${unit ?? ""}`.trim();
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const goToStage = (nextIndex: number) => {
    if (nextIndex < 0 || nextIndex >= operations.length) return;

    setIsRunning(false);
    setCurrentIndex(nextIndex);
    setSaveError("");

    const nextSeconds = Math.round(
      (operations[nextIndex].pieceTimeMinutes ?? 0) * 60
    );
    setRemainingSeconds(nextSeconds);
  };

  const handleStart = () => {
    if (!currentOperation?.pieceTimeMinutes) return;
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setRemainingSeconds(currentStageSeconds);
  };

  const handleOpenConfirm = () => {
    setConfirmOpen(true);
  };

  const handleCloseConfirm = () => {
    setConfirmOpen(false);
  };

  const handleCompleteStage = () => {
    if (!currentOperation) return;

    setIsRunning(false);
    setConfirmOpen(false);

    const nextCompletedCount = completedCount + 1;
    setCompletedCount(nextCompletedCount);

    if (currentIndex < operations.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);

      const nextSeconds = Math.round(
        (operations[nextIndex].pieceTimeMinutes ?? 0) * 60
      );
      setRemainingSeconds(nextSeconds);
    } else {
      setRemainingSeconds(0);
    }
  };

  const handleSaveChanges = async () => {
    if (!currentOperation) return;

    try {
      setSaveLoading(true);
      setSaveError("");

      await api.put(`/operations/${currentOperation.id}`, form);

      if (onOperationUpdated) {
        await onOperationUpdated();
      }

      setEditorEnabled(false);
    } catch (e) {
      console.error(e);
      setSaveError("Не удалось сохранить изменения операции.");
    } finally {
      setSaveLoading(false);
    }
  };

  if (operations.length === 0) {
    return <Alert severity="info">Для этого процесса этапы отсутствуют.</Alert>;
  }

  if (!currentOperation && completedCount < totalStages) {
    return <Alert severity="warning">Не удалось определить текущий этап.</Alert>;
  }

  if (completedCount >= totalStages) {
    return (
      <Stack spacing={3}>
        <Card>
          <CardContent>
            <Stack spacing={2}>
              <Typography variant="h5">Режим производства</Typography>

              <Typography sx={{ fontSize: 18, fontWeight: 600 }}>
                Выполнено этапов: {completedCount} из {totalStages}
              </Typography>

              <LinearProgress
                variant="determinate"
                value={100}
                sx={{ height: 12, borderRadius: 10 }}
              />

              <Alert severity="success">
                Все этапы процесса завершены.
              </Alert>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    );
  }

  return (
    <>
      <Stack spacing={3}>
        <Card>
          <CardContent>
            <Stack spacing={2}>
              <Typography variant="h5">Режим производства</Typography>

              <Typography sx={{ fontSize: 18, fontWeight: 600 }}>
                Выполнено этапов: {completedCount} из {totalStages}
              </Typography>

              <LinearProgress
                variant="determinate"
                value={progressValue}
                sx={{ height: 12, borderRadius: 10 }}
              />

              <Box>
                {!editorEnabled ? (
                  <Button
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={() => setEditorEnabled(true)}
                    sx={{
                      minWidth: 280,
                      minHeight: 56,
                      fontSize: 18,
                      fontWeight: 700,
                      borderRadius: 3,
                    }}
                  >
                    Включить режим редактора
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    color="warning"
                    onClick={() => {
                      setEditorEnabled(false);
                      setSaveError("");
                    }}
                    sx={{
                      minWidth: 280,
                      minHeight: 56,
                      fontSize: 18,
                      fontWeight: 700,
                      borderRadius: 3,
                      boxShadow: "none",
                    }}
                  >
                    Отключить режим редактора
                  </Button>
                )}
              </Box>
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Stack spacing={3}>
              <Typography variant="h6" sx={{ fontSize: 30, fontWeight: 700 }}>
                Текущий этап {currentOperation.operationOrder}: {currentOperation.name}
              </Typography>

              {saveError && <Alert severity="error">{saveError}</Alert>}

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
                  <Typography sx={{ fontSize: 15, color: "text.secondary", mb: 0.5 }}>
                    Рабочий центр
                  </Typography>

                  <Typography sx={{ fontSize: 22, fontWeight: 700 }}>
                    {formatValue(currentOperation.workCenter)}
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
                  <Typography sx={{ fontSize: 15, color: "text.secondary", mb: 0.5 }}>
                    Время по норме
                  </Typography>

                  <Typography sx={{ fontSize: 22, fontWeight: 700 }}>
                    {formatValue(currentOperation.pieceTimeMinutes)} мин
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
                  <Typography sx={{ fontSize: 15, color: "text.secondary", mb: 0.5 }}>
                    Давление
                  </Typography>

                  {editorEnabled ? (
                    <Stack spacing={1}>
                      <TextField
                        label="Значение"
                        type="number"
                        value={form.pressureValue ?? ""}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            pressureValue:
                              e.target.value === "" ? null : Number(e.target.value),
                          }))
                        }
                      />

                      <TextField
                        label="Единица"
                        value={form.pressureUnit ?? ""}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            pressureUnit: e.target.value,
                          }))
                        }
                      />
                    </Stack>
                  ) : (
                    <Typography sx={{ fontSize: 22, fontWeight: 700 }}>
                      {formatParam(
                        currentOperation.pressureValue,
                        currentOperation.pressureUnit
                      )}
                    </Typography>
                  )}
                </Box>

                <Box
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    backgroundColor: "#f8fafc",
                    border: "1px solid #e3e8ef",
                  }}
                >
                  <Typography sx={{ fontSize: 15, color: "text.secondary", mb: 0.5 }}>
                    Температура
                  </Typography>

                  {editorEnabled ? (
                    <Stack spacing={1}>
                      <TextField
                        label="Значение"
                        type="number"
                        value={form.temperatureValue ?? ""}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            temperatureValue:
                              e.target.value === "" ? null : Number(e.target.value),
                          }))
                        }
                      />

                      <TextField
                        label="Единица"
                        value={form.temperatureUnit ?? ""}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            temperatureUnit: e.target.value,
                          }))
                        }
                      />
                    </Stack>
                  ) : (
                    <Typography sx={{ fontSize: 22, fontWeight: 700 }}>
                      {formatParam(
                        currentOperation.temperatureValue,
                        currentOperation.temperatureUnit
                      )}
                    </Typography>
                  )}
                </Box>
              </Box>

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
                  Описание этапа
                </Typography>

                {editorEnabled ? (
                  <TextField
                    multiline
                    minRows={4}
                    fullWidth
                    label="Описание"
                    value={form.operationDescription ?? ""}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        operationDescription: e.target.value,
                      }))
                    }
                  />
                ) : (
                  <Typography
                    sx={{
                      fontSize: 22,
                      lineHeight: 1.5,
                      fontWeight: 600,
                      color: "#1f2937",
                    }}
                  >
                    {formatValue(currentOperation.operationDescription)}
                  </Typography>
                )}
              </Box>

              <Box
                sx={{
                  p: 3,
                  borderRadius: 3,
                  backgroundColor: "#f8fbff",
                  textAlign: "center",
                }}
              >
                <Typography variant="body1" sx={{ mb: 1, fontSize: 18, fontWeight: 600 }}>
                  Таймер этапа
                </Typography>

                {currentOperation.pieceTimeMinutes ? (
                  <>
                    <Typography
                      sx={{
                        fontSize: 72,
                        fontWeight: 800,
                        lineHeight: 1,
                        mb: 3,
                      }}
                    >
                      {formatTimer(remainingSeconds)}
                    </Typography>

                    {!editorEnabled ? (
                      <Stack
                        direction={{ xs: "column", sm: "row" }}
                        spacing={2}
                        justifyContent="center"
                        sx={{ width: "100%" }}
                      >
                        <Button
                          onClick={handleStart}
                          disabled={isRunning}
                          variant="contained"
                          sx={{
                            minWidth: 220,
                            minHeight: 64,
                            fontSize: 22,
                            fontWeight: 700,
                            borderRadius: 3,
                            boxShadow: "none",
                          }}
                        >
                          Запустить таймер
                        </Button>

                        <Button
                          onClick={handlePause}
                          disabled={!isRunning}
                          variant="contained"
                          sx={{
                            minWidth: 180,
                            minHeight: 64,
                            fontSize: 22,
                            fontWeight: 700,
                            borderRadius: 3,
                            backgroundColor: "#616161",
                            color: "#fff",
                            boxShadow: "none",
                            "&:hover": {
                              backgroundColor: "#4f4f4f",
                            },
                            "&.Mui-disabled": {
                              backgroundColor: "#cfcfcf",
                              color: "#7a7a7a",
                            },
                          }}
                        >
                          Пауза
                        </Button>

                        <Button
                          onClick={handleReset}
                          variant="outlined"
                          sx={{
                            minWidth: 180,
                            minHeight: 64,
                            fontSize: 22,
                            fontWeight: 700,
                            borderRadius: 3,
                          }}
                        >
                          Сбросить
                        </Button>

                        <Button
                          color="success"
                          onClick={handleOpenConfirm}
                          variant="contained"
                          sx={{
                            minWidth: 220,
                            minHeight: 64,
                            fontSize: 22,
                            fontWeight: 700,
                            borderRadius: 3,
                            boxShadow: "none",
                          }}
                        >
                          Завершить этап
                        </Button>
                      </Stack>
                    ) : (
                      <Stack
                        direction={{ xs: "column", sm: "row" }}
                        spacing={2}
                        justifyContent="center"
                        sx={{ width: "100%" }}
                      >
                        <Button
                          variant="outlined"
                          onClick={() => goToStage(currentIndex - 1)}
                          disabled={currentIndex === 0 || saveLoading}
                          sx={{
                            minWidth: 220,
                            minHeight: 64,
                            fontSize: 22,
                            fontWeight: 700,
                            borderRadius: 3,
                          }}
                        >
                          Предыдущий этап
                        </Button>

                        <Button
                          startIcon={<SaveIcon />}
                          variant="contained"
                          onClick={handleSaveChanges}
                          disabled={saveLoading}
                          sx={{
                            minWidth: 240,
                            minHeight: 64,
                            fontSize: 22,
                            fontWeight: 700,
                            borderRadius: 3,
                            boxShadow: "none",
                          }}
                        >
                          {saveLoading ? "Сохранение..." : "Сохранить"}
                        </Button>

                        <Button
                          variant="outlined"
                          onClick={() => goToStage(currentIndex + 1)}
                          disabled={currentIndex === operations.length - 1 || saveLoading}
                          sx={{
                            minWidth: 220,
                            minHeight: 64,
                            fontSize: 22,
                            fontWeight: 700,
                            borderRadius: 3,
                          }}
                        >
                          Следующий этап
                        </Button>
                      </Stack>
                    )}
                  </>
                ) : !editorEnabled ? (
                  <Stack spacing={2}>
                    <Alert severity="info">
                      Для этого этапа время не задано.
                    </Alert>

                    <Box>
                      <Button
                        color="success"
                        onClick={handleOpenConfirm}
                        variant="contained"
                        sx={{
                          minWidth: 260,
                          minHeight: 64,
                          fontSize: 22,
                          fontWeight: 700,
                          borderRadius: 3,
                          boxShadow: "none",
                        }}
                      >
                        Завершить этап
                      </Button>
                    </Box>
                  </Stack>
                ) : (
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={2}
                    justifyContent="center"
                    sx={{ width: "100%" }}
                  >
                    <Button
                      variant="outlined"
                      onClick={() => goToStage(currentIndex - 1)}
                      disabled={currentIndex === 0 || saveLoading}
                      sx={{
                        minWidth: 220,
                        minHeight: 64,
                        fontSize: 22,
                        fontWeight: 700,
                        borderRadius: 3,
                      }}
                    >
                      Предыдущий этап
                    </Button>

                    <Button
                      startIcon={<SaveIcon />}
                      variant="contained"
                      onClick={handleSaveChanges}
                      disabled={saveLoading}
                      sx={{
                        minWidth: 240,
                        minHeight: 64,
                        fontSize: 22,
                        fontWeight: 700,
                        borderRadius: 3,
                        boxShadow: "none",
                      }}
                    >
                      {saveLoading ? "Сохранение..." : "Сохранить"}
                    </Button>

                    <Button
                      variant="outlined"
                      onClick={() => goToStage(currentIndex + 1)}
                      disabled={currentIndex === operations.length - 1 || saveLoading}
                      sx={{
                        minWidth: 220,
                        minHeight: 64,
                        fontSize: 22,
                        fontWeight: 700,
                        borderRadius: 3,
                      }}
                    >
                      Следующий этап
                    </Button>
                  </Stack>
                )}
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Stack>

      <Dialog open={confirmOpen} onClose={handleCloseConfirm} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontSize: 24, fontWeight: 700 }}>
          Подтверждение завершения этапа
        </DialogTitle>

        <DialogContent>
          <Stack spacing={2}>
            <Typography sx={{ fontSize: 18 }}>
              Вы точно выполнили все условия для завершения этого этапа?
            </Typography>

            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                backgroundColor: "#f8fafc",
                border: "1px solid #e3e8ef",
              }}
            >
              <Typography sx={{ fontSize: 15, color: "text.secondary" }}>
                Текущий этап
              </Typography>
              <Typography sx={{ fontSize: 22, fontWeight: 700 }}>
                Этап {currentOperation.operationOrder}: {currentOperation.name}
              </Typography>
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            variant="outlined"
            onClick={handleCloseConfirm}
            sx={{
              minWidth: 160,
              minHeight: 56,
              fontSize: 18,
              fontWeight: 700,
              borderRadius: 3,
            }}
          >
            Отмена
          </Button>

          <Button
            color="success"
            variant="contained"
            onClick={handleCompleteStage}
            sx={{
              minWidth: 220,
              minHeight: 56,
              fontSize: 18,
              fontWeight: 700,
              borderRadius: 3,
              boxShadow: "none",
            }}
          >
            Да, этап выполнен
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}