import { useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from "@mui/material";
import { api } from "../api/client";
import type { Operation, UpdateOperationRequest } from "../types/product";

type Props = {
  open: boolean;
  operation: Operation | null;
  onClose: () => void;
  onSaved: () => void;
};

export default function OperationEditDialog({
  open,
  operation,
  onClose,
  onSaved,
}: Props) {
  const [form, setForm] = useState<UpdateOperationRequest>({
    pressureValue: null,
    pressureUnit: "bar",
    temperatureValue: null,
    temperatureUnit: "C",
    operationDescription: "",
    changedBy: "Оператор",
    changeReason: "Ручное уточнение",
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!operation) return;

    setForm({
      pressureValue: operation.pressureValue ?? null,
      pressureUnit: operation.pressureUnit ?? "bar",
      temperatureValue: operation.temperatureValue ?? null,
      temperatureUnit: operation.temperatureUnit ?? "C",
      operationDescription: operation.operationDescription ?? "",
      changedBy: "Оператор",
      changeReason: "Ручное уточнение",
    });
  }, [operation]);

  const handleSave = async () => {
    if (!operation) return;

    try {
      setSaving(true);
      await api.put(`/operations/${operation.id}`, form);
      onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Изменение параметров операции</DialogTitle>

      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <TextField
            label="Давление"
            type="number"
            value={form.pressureValue ?? ""}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                pressureValue: e.target.value === "" ? null : Number(e.target.value),
              }))
            }
          />

          <TextField
            label="Единица давления"
            value={form.pressureUnit ?? ""}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, pressureUnit: e.target.value }))
            }
          />

          <TextField
            label="Температура"
            type="number"
            value={form.temperatureValue ?? ""}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                temperatureValue: e.target.value === "" ? null : Number(e.target.value),
              }))
            }
          />

          <TextField
            label="Единица температуры"
            value={form.temperatureUnit ?? ""}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, temperatureUnit: e.target.value }))
            }
          />

          <TextField
            label="Описание"
            multiline
            minRows={3}
            value={form.operationDescription ?? ""}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                operationDescription: e.target.value,
              }))
            }
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button variant="outlined" onClick={onClose}>
          Отмена
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          Сохранить
        </Button>
      </DialogActions>
    </Dialog>
  );
}