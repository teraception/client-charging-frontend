import { SerializedStyles } from "@emotion/react";
import clsx from "clsx";
import { defaults } from "lodash-es";
import { css } from "@emotion/css";
import { Theme, useTheme } from "@mui/material";
import { useMemo } from "react";

export interface BaseComponentProps<T extends string | symbol = never> {
  className?: string;
  classes?: Partial<Record<T, string>>;
}

export type StyleClassKey<T> = T extends (props: any, theme: Theme) => infer K
  ? keyof K
  : never;

export const makeStyles = <T extends string | symbol = never>(
  styleClasses: (
    props: any,
    theme: Theme
  ) => {
    [index: string]: SerializedStyles;
  }
) =>
  [
    (
      props?: BaseComponentProps<T>,
      ...memomizeKey: any[]
    ): Partial<Record<T, string>> => {
      const theme = useTheme();
      return useMemo(() => {
        const classes: any = defaults(
          {},
          styleClasses ? styleClasses(props, theme) : {}
        );
        if (props && props.classes) {
          Object.keys(props.classes).forEach((key) => {
            classes[key] = clsx(classes[key], props.classes[key]) as any;
          });
        }

        Object.keys(classes).forEach((key) => {
          if ("name" in classes[key]) {
            classes[key] = css(classes[key]);
          }
        });

        return classes as any as Partial<Record<T, string>>;
      }, [theme, props?.classes, ...memomizeKey]);
    },
    (
      props?: BaseComponentProps<T>,
      ...memomizeKey: any[]
    ): Partial<Record<T, SerializedStyles>> => {
      const theme = useTheme();
      return useMemo(() => {
        const classes: any = defaults(
          {},
          styleClasses ? styleClasses(props, theme) : {}
        );
        if (props && props.classes) {
          Object.keys(props.classes).forEach((key) => {
            classes[key] = clsx(classes[key], props.classes[key]) as any;
          });
        }

        return classes as any as Partial<Record<T, SerializedStyles>>;
      }, [theme, props?.classes, ...memomizeKey]);
    },
  ] as const;
