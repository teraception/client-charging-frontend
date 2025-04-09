import { DistributiveOmit } from "@emotion/react";
import { Theme } from "@mui/material";
import { StyledComponentProps } from "@mui/material";

export type StandardProps<
  C,
  ClassKey extends string,
  Removals extends keyof C = never
> = DistributiveOmit<C, "classes" | Removals> &
  StyledComponentProps<ClassKey> & {
    className?: string;
    ref?: C extends { ref?: infer RefType } ? RefType : React.Ref<unknown>;
    style?: React.CSSProperties;
  };
