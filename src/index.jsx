import { createRoot } from "react-dom/client";
import { SpaContainer, typographyContext } from "pankosmia-rcl";
import { createHashRouter, Outlet, RouterProvider } from "react-router-dom";

import "./index.css";

import CreatTCProject from "./pages/CreateTCProject";
import NewTCoreContent from "./pages/tCoreContent";
import CreatTCProjectFromFile from "./pages/CreatTCProjectFromFile";

import { createTheme, ThemeProvider } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";

import { useContext, useEffect, useMemo, useState } from "react";
import { getAndSetJson } from "pithekos-lib";

import { SnackbarProvider, MaterialDesignContent } from "notistack";
import { styled } from "@mui/material/styles";

/* ---------------- ROUTER ---------------- */

const router = createHashRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { path: "/createDocument/tCContent", element: <CreatTCProject /> },
      { path: "/createDocument/tCContentRaw", element: <NewTCoreContent /> },
      {
        path: "/createDocument/tCContentFromFile",
        element: <CreatTCProjectFromFile />,
      },
    ],
  },
]);

/* ---------------- APP LAYOUT ---------------- */

function AppLayout() {
  const { typographyRef } = useContext(typographyContext);

  const [themeSpec, setThemeSpec] = useState({
    palette: {
      primary: { main: "#666" },
      secondary: { main: "#888" },
    },
  });

  const [fontFamily, setFontFamily] = useState([]);
  const [fontFamilyCorrespondance, setFontFamilyCorrespondance] =
    useState(null);
  const [fontsReady, setFontsReady] = useState(false);

  /* ---------------- LOAD THEME JSON ---------------- */

  useEffect(() => {
    if (themeSpec?.palette?.primary?.main !== "#666") return;

    getAndSetJson({
      url: "/app-resources/themes/default.json",
      setter: setThemeSpec,
    }).then();
  }, []);

  /* ---------------- WAIT FOR FONTS ---------------- */

  useEffect(() => {
    document.fonts.ready.then(() => setFontsReady(true));
  }, []);

  /* ---------------- MAP TYPOGRAPHY FONTS ---------------- */
  useEffect(() => {
    if (fontFamilyCorrespondance) {
      let stringFront = [];
      let newFont = {};
      let table = typographyRef.current.font_set.split("Pankosmia");
      table.shift();
      table = table.map((e) => "Pankosmia" + e);
      Object.entries(fontFamilyCorrespondance).forEach(([k, v]) => {
        let index = table.indexOf(k);
        if (index >= 0) {
          newFont[index] = v;
        }
      });
      for (let e = 0; e < Object.keys(table).length; e++) {
        if (newFont[e]) {
          stringFront.push(newFont[e]);
        }
      }
      setFontFamily(stringFront);
    }
  }, [typographyRef.current?.font_set, fontFamilyCorrespondance]);

  useEffect(() => {
    let cores = {};

    document.fonts.ready.then(() => {
      document.fonts.forEach((f) => {
        const cleanFamily = f.family
          .replace(/['"]/g, "") // remove quotes " or '
          .trim() // remove leading/trailing spaces
          .replace(/\s+/g, " "); // normalize multiple spaces

        cores[cleanFamily.replaceAll(" ", "")] = cleanFamily;
      });

      setFontFamilyCorrespondance(cores);
    });
  }, []);
  /* ---------------- BUILD THEME (NO STATE) ---------------- */

  const theme = useMemo(() => {
    const fontStack =
      fontFamily?.length > 0
        ? fontFamily.join(",")
        : "Roboto, Arial, sans-serif";

    return createTheme({
      ...themeSpec,

      typography: {
        fontFamily: fontStack,
      },

      components: {
        MuiCssBaseline: {
          styleOverrides: {
            body: {
              fontFamily: fontStack,
            },
          },
        },

        MuiTypography: {
          styleOverrides: {
            root: {
              fontFamily: fontStack,
            },
          },
        },

        MuiButton: {
          styleOverrides: {
            root: {
              fontFamily: fontStack,
            },
          },
        },

        MuiListItemText: {
          styleOverrides: {
            primary: { fontFamily: fontStack },
            secondary: { fontFamily: fontStack },
          },
        },
      },
    });
  }, [themeSpec, fontFamily]);

  /* ---------------- SNACKBAR STYLE ---------------- */
  const CustomSnackbarContent = styled(MaterialDesignContent)(() => ({
    "&.notistack-MuiContent-error": {
      backgroundColor: "#FDEDED",
      color: "#D32F2F",
    },
    "&.notistack-MuiContent-info": {
      backgroundColor: "#E5F6FD",
      color: "#0288D1",
    },
    "&.notistack-MuiContent-warning": {
      backgroundColor: "#FFF4E5",
      color: "#EF6C00",
    },
    "&.notistack-MuiContent-success": {
      backgroundColor: "#EDF7ED",
      color: "#2E7D32",
    },
  }));

  /* ---------------- LOADING GATE ---------------- */

  if (!fontsReady) {
    return <div>loading...</div>;
  }

  /* ---------------- RENDER ---------------- */

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <SnackbarProvider
        Components={{
          error: CustomSnackbarContent,
          info: CustomSnackbarContent,
          warning: CustomSnackbarContent,
          success: CustomSnackbarContent,
        }}
        maxSnack={6}
      >
        <Outlet />
      </SnackbarProvider>
    </ThemeProvider>
  );
}

/* ---------------- BOOTSTRAP ---------------- */

createRoot(document.getElementById("root")).render(
  <SpaContainer>
    <RouterProvider router={router} />
  </SpaContainer>,
);
