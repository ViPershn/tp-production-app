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

type Stage = {
  order: number;
  operations: Operation[];
};

const normalizeText = (value: string | null | undefined) =>
  (value ?? "").trim().toLowerCase();

const completenessScore = (op: Operation) => {
  let score = 0;

  if (op.workCenter) score += 3;
  if (op.setupVariant) score += 2;
  if (op.operationDescription) score += 3;
  if (op.pressureValue !== null && op.pressureValue !== undefined) score += 1;
  if (op.pressureUnit) score += 1;
  if (op.temperatureValue !== null && op.temperatureValue !== undefined) score += 1;
  if (op.temperatureUnit) score += 1;
  if (op.pieceTimeMinutes !== null && op.pieceTimeMinutes !== undefined) score += 1;

  return score;
};

const operationSort = (a: Operation, b: Operation) => {
  if (a.operationOrder !== b.operationOrder) {
    return a.operationOrder - b.operationOrder;
  }

  const aNum = a.operationNumber ?? 999999;
  const bNum = b.operationNumber ?? 999999;

  if (aNum !== bNum) {
    return aNum - bNum;
  }

  return a.id - b.id;
};

export default function ProductionFlow({
  operations,
  onOperationUpdated,
}: Props) {
  const [selectedOperationId, setSelectedOperationId] = useState<number | null>(null);
  const [editorStageIndex, setEditorStageIndex] = useState(0);

  const [timers, setTimers] = useState<Record<number, number>>({});
  const [runningOperationIds, setRunningOperationIds] = useState<number[]>([]);
  const [completedOperationIds, setCompletedOperationIds] = useState<number[]>([]);

  const [confirmOpen, setConfirmOpen] = useState(false);

  const [editorEnabled, setEditorEnabled] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState("");

  const [form, setForm] = useState<UpdateOperationRequest>({
    pressureValue: null,
    pressureUnit: "bar",
    temperatureValue: null,
    temperatureUnit: "C",
    operationDescription: "",
    changedBy: "Оператор",
    changeReason: "Ручное уточнение параметров",
  });

  const displayOperations = useMemo<Operation[]>(() => {
    const sorted = [...operations].sort(operationSort);
    const map = new Map<string, Operation>();

    for (const op of sorted) {
      const key = [
        op.operationOrder,
        op.operationNumber ?? "",
        normalizeText(op.name),
        normalizeText(op.setupVariant),
        op.pieceTimeMinutes ?? "",
        op.pressureValue ?? "",
        normalizeText(op.pressureUnit),
        op.temperatureValue ?? "",
        normalizeText(op.temperatureUnit),
        normalizeText(op.operationDescription),
      ].join("|");

      const existing = map.get(key);

      if (!existing) {
        map.set(key, op);
        continue;
      }

      if (completenessScore(op) > completenessScore(existing)) {
        map.set(key, op);
      }
    }

    return Array.from(map.values()).sort(operationSort);
  }, [operations]);

  const stages = useMemo<Stage[]>(() => {
    const grouped = new Map<number, Operation[]>();

    for (const op of displayOperations) {
      const list = grouped.get(op.operationOrder) ?? [];
      list.push(op);
      grouped.set(op.operationOrder, list);
    }

    return Array.from(grouped.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([order, ops]) => ({
        order,
        operations: ops.sort(operationSort),
      }));
  }, [displayOperations]);

  const totalStages = stages.length;

  const completedStagesCount = useMemo(() => {
    return stages.filter((stage) =>
      stage.operations.every((op) => completedOperationIds.includes(op.id))
    ).length;
  }, [stages, completedOperationIds]);

  const firstUnfinishedStageIndex = useMemo(() => {
    return stages.findIndex((stage) =>
      stage.operations.some((op) => !completedOperationIds.includes(op.id))
    );
  }, [stages, completedOperationIds]);

  const productionStageIndex =
    firstUnfinishedStageIndex === -1
      ? Math.max(stages.length - 1, 0)
      : firstUnfinishedStageIndex;

  const activeStageIndex = editorEnabled
    ? Math.min(Math.max(editorStageIndex, 0), Math.max(stages.length - 1, 0))
    : productionStageIndex;

  const currentStage = stages[activeStageIndex] ?? null;
  const currentStageOperations = currentStage?.operations ?? [];

  const selectedOperation =
    currentStageOperations.find((op) => op.id === selectedOperationId) ??
    currentStageOperations[0] ??
    null;

  const progressValue =
    totalStages === 0 ? 0 : Math.round((completedStagesCount / totalStages) * 100);

  const allCurrentStageCompleted =
    currentStageOperations.length > 0 &&
    currentStageOperations.every((op) => completedOperationIds.includes(op.id));

  useEffect(() => {
    const availableIds = new Set(displayOperations.map((op) => op.id));

    setTimers((prev) => {
      const next: Record<number, number> = {};

      for (const op of displayOperations) {
        next[op.id] = prev[op.id] ?? Math.round((op.pieceTimeMinutes ?? 0) * 60);
      }

      return next;
    });

    setRunningOperationIds((prev) => prev.filter((id) => availableIds.has(id)));
    setCompletedOperationIds((prev) => prev.filter((id) => availableIds.has(id)));

    setConfirmOpen(false);
    setSaveError("");
  }, [displayOperations]);

  useEffect(() => {
    if (editorEnabled) {
      setEditorStageIndex(productionStageIndex);
    }
  }, [editorEnabled, productionStageIndex]);

  useEffect(() => {
    if (currentStageOperations.length === 0) {
      setSelectedOperationId(null);
      return;
    }

    setSelectedOperationId((prev) => {
      const exists = currentStageOperations.some((op) => op.id === prev);
      return exists ? prev : currentStageOperations[0].id;
    });
  }, [activeStageIndex, currentStageOperations]);

  useEffect(() => {
    if (!selectedOperation) return;

    setForm({
      pressureValue: selectedOperation.pressureValue ?? null,
      pressureUnit: selectedOperation.pressureUnit ?? "bar",
      temperatureValue: selectedOperation.temperatureValue ?? null,
      temperatureUnit: selectedOperation.temperatureUnit ?? "C",
      operationDescription: selectedOperation.operationDescription ?? "",
      changedBy: "Оператор",
      changeReason: "Ручное уточнение параметров",
    });
  }, [selectedOperation]);

  useEffect(() => {
    if (runningOperationIds.length === 0) return;

    const timer = window.setInterval(() => {
      setTimers((prev) => {
        const next = { ...prev };

        for (const id of runningOperationIds) {
          const current = next[id] ?? 0;
          next[id] = current > 0 ? current - 1 : 0;
        }

        return next;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [runningOperationIds]);

  useEffect(() => {
    setRunningOperationIds((prev) => prev.filter((id) => (timers[id] ?? 0) > 0));
  }, [timers]);

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

  const moveEditorStage = (delta: number) => {
    const next = editorStageIndex + delta;
    if (next < 0 || next >= stages.length) return;

    setEditorStageIndex(next);
    setSaveError("");
  };

  const startOperationTimer = (operationId: number) => {
    const seconds = timers[operationId] ?? 0;
    if (seconds <= 0) return;

    setRunningOperationIds((prev) =>
      prev.includes(operationId) ? prev : [...prev, operationId]
    );
  };

  const pauseOperationTimer = (operationId: number) => {
    setRunningOperationIds((prev) => prev.filter((id) => id !== operationId));
  };

  const resetOperationTimer = (operationId: number) => {
    pauseOperationTimer(operationId);

    const op = displayOperations.find((item) => item.id === operationId);
    setTimers((prev) => ({
      ...prev,
      [operationId]: Math.round((op?.pieceTimeMinutes ?? 0) * 60),
    }));
  };

  const openCompleteDialog = (operationId: number) => {
    setSelectedOperationId(operationId);
    setConfirmOpen(true);
  };

  const handleCloseConfirm = () => {
    setConfirmOpen(false);
  };

  const handleCompleteOperation = () => {
    if (!selectedOperation) return;

    const operationId = selectedOperation.id;

    pauseOperationTimer(operationId);

    setCompletedOperationIds((prev) =>
      prev.includes(operationId) ? prev : [...prev, operationId]
    );

    setConfirmOpen(false);
  };

  const handleSaveChanges = async () => {
    if (!selectedOperation) return;

    try {
      setSaveLoading(true);
      setSaveError("");

      await api.put(`/operations/${selectedOperation.id}`, form);

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

  if (displayOperations.length === 0 || totalStages === 0) {
    return <Alert severity="info">Для этого процесса этапы отсутствуют.</Alert>;
  }

  if (completedStagesCount >= totalStages) {
    return (
      <Stack spacing={3}>
        <Card>
          <CardContent>
            <Stack spacing={2}>
              <Typography variant="h5">Режим производства</Typography>

              <Typography sx={{ fontSize: 18, fontWeight: 600 }}>
                Выполнено шагов: {completedStagesCount} из {totalStages}
              </Typography>

              <LinearProgress
                variant="determinate"
                value={100}
                sx={{ height: 12, borderRadius: 10 }}
              />

              <Alert severity="success">Все шаги процесса завершены.</Alert>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    );
  }

  if (!currentStage || currentStageOperations.length === 0) {
    return (
      <Alert severity="warning">
        Не удалось определить текущий этап. Проверь данные операций.
      </Alert>
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
                Выполнено шагов: {completedStagesCount} из {totalStages}
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
                Текущий шаг {currentStage.order}
              </Typography>

              {saveError && <Alert severity="error">{saveError}</Alert>}

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
                  gap: 2,
                }}
              >
                {currentStageOperations.map((op) => {
                  const isSelected = selectedOperation?.id === op.id;
                  const isCompleted = completedOperationIds.includes(op.id);
                  const isRunning = runningOperationIds.includes(op.id);
                  const remainingSeconds = timers[op.id] ?? 0;

                  return (
                    <Card
                      key={op.id}
                      sx={{
                        borderRadius: 3,
                        border: isSelected ? "2px solid #1565c0" : "1px solid #e3e8ef",
                        backgroundColor: isCompleted ? "#f0fff4" : "#ffffff",
                      }}
                    >
                      <CardContent>
                        <Stack spacing={2}>
                          <Typography sx={{ fontSize: 22, fontWeight: 700 }}>
                            Операция {op.operationNumber ?? "—"}: {op.name}
                          </Typography>

                          <Typography sx={{ fontSize: 16, color: "text.secondary" }}>
                            Рабочий центр: {op.workCenter ?? "—"}
                          </Typography>

                          <Typography sx={{ fontSize: 16, color: "text.secondary" }}>
                            Норма времени: {op.pieceTimeMinutes ?? "—"} мин
                          </Typography>

                          <Typography sx={{ fontSize: 36, fontWeight: 800 }}>
                            {formatTimer(remainingSeconds)}
                          </Typography>

                          <Stack
                            direction={{ xs: "column", sm: "row" }}
                            spacing={1}
                            flexWrap="wrap"
                          >
                            <Button
                              variant="outlined"
                              onClick={() => setSelectedOperationId(op.id)}
                            >
                              Выбрать
                            </Button>

                            <Button
                              variant="contained"
                              onClick={() => startOperationTimer(op.id)}
                              disabled={isRunning || remainingSeconds <= 0 || isCompleted}
                            >
                              Старт
                            </Button>

                            <Button
                              variant="outlined"
                              onClick={() => pauseOperationTimer(op.id)}
                              disabled={!isRunning}
                            >
                              Пауза
                            </Button>

                            <Button
                              variant="outlined"
                              onClick={() => resetOperationTimer(op.id)}
                              disabled={isCompleted}
                            >
                              Сброс
                            </Button>

                            <Button
                              color="success"
                              variant="contained"
                              onClick={() => openCompleteDialog(op.id)}
                              disabled={isCompleted}
                            >
                              {isCompleted ? "Завершено" : "Завершить"}
                            </Button>
                          </Stack>
                        </Stack>
                      </CardContent>
                    </Card>
                  );
                })}
              </Box>

              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: allCurrentStageCompleted ? "#f0fff4" : "#fff8e1",
                  border: allCurrentStageCompleted
                    ? "2px solid #86efac"
                    : "2px solid #ffe082",
                }}
              >
                <Typography
                  sx={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: allCurrentStageCompleted ? "#166534" : "#7a5a00",
                  }}
                >
                  {allCurrentStageCompleted
                    ? "Все операции текущего шага завершены."
                    : "Для перехода дальше нужно завершить все операции текущего шага."}
                </Typography>
              </Box>

              {selectedOperation && (
                <>
                  <Box
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      backgroundColor: "#f8fafc",
                      border: "1px solid #e3e8ef",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: 16,
                        fontWeight: 700,
                        color: "text.secondary",
                        mb: 2,
                      }}
                    >
                      Выбранная операция для просмотра и редактирования
                    </Typography>

                    <Typography sx={{ fontSize: 26, fontWeight: 800, mb: 2 }}>
                      Операция {selectedOperation.operationNumber ?? "—"}:{" "}
                      {selectedOperation.name}
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
                          backgroundColor: "#ffffff",
                          border: "1px solid #e3e8ef",
                        }}
                      >
                        <Typography
                          sx={{ fontSize: 15, color: "text.secondary", mb: 0.5 }}
                        >
                          Рабочий центр
                        </Typography>

                        <Typography sx={{ fontSize: 22, fontWeight: 700 }}>
                          {formatValue(selectedOperation.workCenter)}
                        </Typography>
                      </Box>

                      <Box
                        sx={{
                          p: 2,
                          borderRadius: 3,
                          backgroundColor: "#ffffff",
                          border: "1px solid #e3e8ef",
                        }}
                      >
                        <Typography
                          sx={{ fontSize: 15, color: "text.secondary", mb: 0.5 }}
                        >
                          Время по норме
                        </Typography>

                        <Typography sx={{ fontSize: 22, fontWeight: 700 }}>
                          {formatValue(selectedOperation.pieceTimeMinutes)} мин
                        </Typography>
                      </Box>

                      <Box
                        sx={{
                          p: 2,
                          borderRadius: 3,
                          backgroundColor: "#ffffff",
                          border: "1px solid #e3e8ef",
                        }}
                      >
                        <Typography
                          sx={{ fontSize: 15, color: "text.secondary", mb: 0.5 }}
                        >
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
                              selectedOperation.pressureValue,
                              selectedOperation.pressureUnit
                            )}
                          </Typography>
                        )}
                      </Box>

                      <Box
                        sx={{
                          p: 2,
                          borderRadius: 3,
                          backgroundColor: "#ffffff",
                          border: "1px solid #e3e8ef",
                        }}
                      >
                        <Typography
                          sx={{ fontSize: 15, color: "text.secondary", mb: 0.5 }}
                        >
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
                              selectedOperation.temperatureValue,
                              selectedOperation.temperatureUnit
                            )}
                          </Typography>
                        )}
                      </Box>
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
                      Описание выбранной операции
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
                        {formatValue(selectedOperation.operationDescription)}
                      </Typography>
                    )}
                  </Box>

                  {editorEnabled && (
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      spacing={2}
                      justifyContent="center"
                    >
                      <Button
                        variant="outlined"
                        onClick={() => moveEditorStage(-1)}
                        disabled={editorStageIndex === 0 || saveLoading}
                        sx={{
                          minWidth: 220,
                          minHeight: 64,
                          fontSize: 22,
                          fontWeight: 700,
                          borderRadius: 3,
                        }}
                      >
                        Предыдущий шаг
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
                        onClick={() => moveEditorStage(1)}
                        disabled={editorStageIndex >= stages.length - 1 || saveLoading}
                        sx={{
                          minWidth: 220,
                          minHeight: 64,
                          fontSize: 22,
                          fontWeight: 700,
                          borderRadius: 3,
                        }}
                      >
                        Следующий шаг
                      </Button>
                    </Stack>
                  )}
                </>
              )}
            </Stack>
          </CardContent>
        </Card>
      </Stack>

      <Dialog open={confirmOpen} onClose={handleCloseConfirm} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontSize: 24, fontWeight: 700 }}>
          Подтверждение завершения операции
        </DialogTitle>

        <DialogContent>
          <Stack spacing={2}>
            <Typography sx={{ fontSize: 18 }}>
              Вы точно выполнили все условия для завершения этой операции?
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
                Выбранная операция
              </Typography>
              <Typography sx={{ fontSize: 22, fontWeight: 700 }}>
                Операция {selectedOperation?.operationNumber ?? "—"}:{" "}
                {selectedOperation?.name ?? "—"}
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
            onClick={handleCompleteOperation}
            sx={{
              minWidth: 220,
              minHeight: 56,
              fontSize: 18,
              fontWeight: 700,
              borderRadius: 3,
              boxShadow: "none",
            }}
          >
            Да, операция выполнена
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}