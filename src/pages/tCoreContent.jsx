import { useState, useEffect, useContext } from "react";
import { DialogContent } from "@mui/material";
import { postJson, doI18n, getJson, postEmptyJson } from "pithekos-lib";
import { useNavigate, useSearchParams } from "react-router-dom";
import { i18nContext, debugContext } from "pankosmia-rcl";
import { enqueueSnackbar } from "notistack";
const checkExistingRepo = async (name) => {
  const response = await getJson("/burrito/metadata/summaries");
  const data = await response.json;

  // Filter only those with flavor_type = scripture
  const burritoArray = Object.entries(data).map(([key, value]) => ({
    path: key,
    ...value,
  }));

  const scriptures = burritoArray.find(
    (item) => item?.flavor === "x-tcore" && item?.abbreviation === name,
  );
  if (scriptures) {
    if (Object.keys(scriptures).length > 0) {
      return true;
    }
  }
  return false;
};
// {

//             }
export const handleCreate = async (burritoAbr, debugRef, i18nRef) => {
  let isHere = await checkExistingRepo(`${burritoAbr.toLowerCase()}_tcchecks`);
  if (isHere) {
    enqueueSnackbar(
      `${doI18n(
        "pages:core-contenthandler_t_core:project_already_exist",
        i18nRef.current,
      )}`,
      {
        variant: "error",
      },
    );
  } else {
    const payload = {
      usfm_repo_path: `_local_/_local_/${burritoAbr}`,
      book_code: "",
    };
    const response = await postJson(
      "/git/new-tcore-resource",
      JSON.stringify(payload),
      debugRef.current,
    );
    if (response.ok) {
      return true;
    } else {
      enqueueSnackbar(
        `${doI18n(
          "pages:core-contenthandler_t_core:t_core_project_not_created",
          i18nRef.current,
        )}: ${response.status}`,
        {
          variant: "error",
        },
      );
    }
  }
};

export default function NewTCoreContent() {
  const { i18nRef } = useContext(i18nContext);
  const { debugRef } = useContext(debugContext);

  const [searchParams] = useSearchParams();
  const burritoName = searchParams.get("burritoName") || "";

  useEffect(() => {
    async function creatOrGo() {
      //toDo selectedBurrito = ??
      if (!(await checkExistingRepo(burritoName))) {
        let isOk = await handleCreate(burritoName, debugRef, i18nRef);
      }
      await postEmptyJson(
        `/app-state/current-project/_local_/_local_/${burritoName.toLowerCase()}_tcchecks`,
      );

      window.location.href = `/clients/uw-client-checks#`;
    }
    creatOrGo();
  }, []);

  return <></>;
}
