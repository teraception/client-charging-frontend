import { Breakpoint, ThemeOptions, createTheme } from "@mui/material/styles";
import React from "react";
import resolveConfig from "tailwindcss/resolveConfig";
import tailwindConfiguration from "@root/tailwind.config";

const tailwindConfig = resolveConfig(tailwindConfiguration).theme;

declare module "@mui/material/styles" {
  //custom theme options typings
  interface Theme extends ThemeOptions {}
  interface ThemeOptions {
    colors?: {
      green: React.CSSProperties["color"];
      red?: React.CSSProperties["color"];
      darkGrey?: React.CSSProperties["color"];
      white?: React.CSSProperties["color"];
      aluminium?: React.CSSProperties["color"];
      pastelGrey?: React.CSSProperties["color"];
      dune?: React.CSSProperties["color"];
      mercury?: React.CSSProperties["color"];
      silverChalice?: React.CSSProperties["color"];
      jungleGreen?: React.CSSProperties["color"];
      mountainMist?: React.CSSProperties["color"];
      smokeyGrey?: React.CSSProperties["color"];
      whiteIce?: React.CSSProperties["color"];
    };
    drawer?: {
      breakpoint: Breakpoint;
      width: React.CSSProperties["width"];
      titleFontSize: React.CSSProperties["fontSize"];
      color: React.CSSProperties["color"];
      activeItemColor: React.CSSProperties["color"];
      activeColor: React.CSSProperties["color"];
      logoSize: React.CSSProperties["width"];
    };
    header?: {
      height: React.CSSProperties["height"];
      color: React.CSSProperties["color"];
      titleFontSize: React.CSSProperties["fontSize"];
      background: React.CSSProperties["background"];
    };
    footer?: {
      height: React.CSSProperties["height"];
      zIndex: React.CSSProperties["zIndex"];
      aboveFooter: React.CSSProperties["zIndex"];
      zIndexOnModal: React.CSSProperties["zIndex"];
    };
    custom?: {
      sectionTopMargin: React.CSSProperties["marginTop"];
    };
  }
}

function createAppTheme(options: ThemeOptions) {
  const primaryMain = tailwindConfig.colors.primaryMain;
  const primaryDark = tailwindConfig.colors.primaryDark;
  const theme = createTheme({
    typography: {
      ...({
        useNextVariants: true,
      } as any),
    },
  });
  return createTheme({
    typography: {
      ...({
        useNextVariants: true,
      } as any),
      fontFamily: tailwindConfig.fontFamily.join(","),
    },
    drawer: {
      breakpoint: "md",
      width: "260px",
      titleFontSize: "28px",
      color: tailwindConfig.colors.drawerColor,
      activeItemColor: tailwindConfig.colors.white,
      activeColor: tailwindConfig.colors.primaryMain,
      logoSize: "150px",
    },
    header: {
      height: "70px",
      color: tailwindConfig.colors.white,
      background: tailwindConfig.colors.white,
      titleFontSize: "20px",
    },
    footer: {
      height: "42px",
      zIndex: 1202,
      aboveFooter: 1304,
      zIndexOnModal: 1301,
    },
    palette: {
      primary: {
        main: primaryMain,
        dark: primaryDark,
        contrastText: tailwindConfig.colors.white,
      },
      secondary: {
        main: primaryMain,
        contrastText: tailwindConfig.colors.white,
      },
      text: {
        primary: tailwindConfig.colors.riverBed,
        secondary: tailwindConfig.colors.santaGrey,
      },

      background: {
        default: tailwindConfig.colors.white,
        paper: tailwindConfig.colors.white,
      },
      common: {
        black: tailwindConfig.colors.black,
        white: tailwindConfig.colors.white,
      },
      grey: {
        "200": tailwindConfig.colors.magnolia,
        "300": tailwindConfig.colors.porcelain,
        "400": tailwindConfig.colors.platinum,
        "600": tailwindConfig.colors.ashGrey,
        "700": tailwindConfig.colors.silverChalice,
      },
    },
    colors: {
      green: tailwindConfig.colors.green,
      red: tailwindConfig.colors.red,
      darkGrey: tailwindConfig.colors.darkGrey,
      white: tailwindConfig.colors.white,
      pastelGrey: tailwindConfig.colors.pastelGrey,
      aluminium: tailwindConfig.colors.aluminium,
      dune: tailwindConfig.colors.dune,
      mercury: tailwindConfig.colors.mercury,
      silverChalice: tailwindConfig.colors.silverChalice,
      jungleGreen: tailwindConfig.colors.jungleGreen,
      mountainMist: tailwindConfig.colors.mountainMist,
      smokeyGrey: tailwindConfig.colors.smokeyGrey,
      whiteIce: tailwindConfig.colors.whiteIce,
    },
    breakpoints: {
      ...theme.breakpoints,
      values: {
        xs: tailwindConfig.screens.sm,
        sm: tailwindConfig.screens.md,
        md: tailwindConfig.screens.lg,
        lg: tailwindConfig.screens.xl,
        xl: tailwindConfig.screens["2xl"],
      },
    },
    zIndex: {},
    ...options,
  });
}

export const theme = createAppTheme({});

export default theme;
