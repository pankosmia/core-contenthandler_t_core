import { PanDialog, PanDialogActions, i18nContext } from "pankosmia-rcl";
import { Button, DialogContent, Box, Typography } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { doI18n } from "pithekos-lib";
import { useNavigate } from "react-router-dom";
import { useFilePicker } from "use-file-picker";

export default function CreatTCProject() {
  const { i18nRef } = useContext(i18nContext);
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedUUID, setSelectedUUID] = useState(null);

  // USFM picker
  const { openFilePicker: openUsfmPicker, filesContent: usfmFiles } =
    useFilePicker({
      accept: [".sfm", ".usfm"],
    });

  // ZIP picker
  const { openFilePicker: openZipPicker, plainFiles: zipPlainFiles } =
    useFilePicker({
      accept: [".zip"],
      readFilesContent: false, // 👈 key change
    });

  useEffect(() => {
    if (usfmFiles.length > 0) {
      const file = usfmFiles[0];

      setSelectedFile(file.name);
      uploadFile(file, "usfm");
    }
  }, [usfmFiles]);

  useEffect(() => {
    if (zipPlainFiles.length > 0) {
      const file = zipPlainFiles[0]; // This is a real File object
      setSelectedFile(file.name);
      uploadFile(file, "zip");
    }
  }, [zipPlainFiles]);
  useEffect(() => {
    if (!selectedFile || !selectedUUID) return;

    const timeout = setTimeout(() => {
      navigate(
        `/createDocument/tCContentFromFile?file=${encodeURIComponent(
          selectedFile,
        )}&uuid=${selectedUUID}`,
      );
    }, 100);

    return () => clearTimeout(timeout);
  }, [selectedFile, selectedUUID]);
  // 🔥 upload function
  const uploadFile = async (fileContent, type) => {
    const formData = new FormData();

    if (type === "zip") {
      // fileContent is a real File object — append directly, no Blob wrapping
      formData.append("file", fileContent, fileContent.name);
    } else {
      // fileContent is {content: string, name: string} from use-file-picker
      const blob = new Blob([fileContent.content], {
        type: "application/octet-stream",
      });
      formData.append("file", blob, fileContent.name);
    }

    try {
      const response = await fetch("/temp/bytes", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      setSelectedUUID(result.uuid);
    } catch (err) {
      console.error("Upload error:", err);
    }
  };
  return (
    <PanDialog
      titleLabel={doI18n(
        "pages:core-contenthandler_t_core:import",
        i18nRef.current,
      )}
      isOpen={true}
      closeFn={() => (window.location.href = "/clients/main")}
    >
      <DialogContent>
        <Box display="flex" gap={2} flexWrap="wrap" justifyContent="center">
          <Button variant="outlined" onClick={openUsfmPicker}>
            <Typography>
              {doI18n(
                "pages:core-contenthandler_t_core:from_usfm",
                i18nRef.current,
              )}
            </Typography>
          </Button>

          <Button variant="outlined" onClick={openZipPicker}>
            <Typography>
              {doI18n(
                "pages:core-contenthandler_t_core:from_tC3_project",
                i18nRef.current,
              )}
            </Typography>
          </Button>

          {/* <Button
            variant="outlined"
            onClick={() => navigate("/createDocument/tCContentRaw")}
          >
            <Typography>
              {doI18n(
                "pages:core-contenthandler_t_core:from_local_text_translation",
                i18nRef.current,
              )}
            </Typography>
          </Button> */}
        </Box>
      </DialogContent>

      <PanDialogActions
        closeFn={() => (window.location.href = "/clients/main")}
        closeLabel={doI18n(
          "pages:core-contenthandler_t_core:close",
          i18nRef.current,
        )}
        closeOnAction={false}
        onlyCloseButton={true}
      />
    </PanDialog>
  );
}
