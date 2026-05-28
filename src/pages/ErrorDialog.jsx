import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Typography,
} from "@mui/material";
import { doI18n } from "pithekos-lib";
import { i18nContext } from "pankosmia-rcl";
import { useContext } from "react";

export default function ErrorDialog({
  setErrorDialogOpen,
  handleClose,
  errorDialogOpen,
  errorMessage,
}) {
  const { i18nRef } = useContext(i18nContext);

  const handleCloseErrorDialog = () => {
    setErrorDialogOpen(false);
    handleClose();
  };

  return (
    <Dialog open={errorDialogOpen} onClose={handleCloseErrorDialog}>
      <DialogContent>
        <Typography color="error">{errorMessage}</Typography>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={handleCloseErrorDialog}
          variant="contained"
          color="primary"
        >
          {doI18n("pages:content:close", i18nRef.current)}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
