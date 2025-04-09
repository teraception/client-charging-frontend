import { Grid } from "@mui/material";
export interface AppDialogFooterProps {
  children: React.ReactNode;
}
export const AppDialogFooter: React.FC<AppDialogFooterProps> = ({
  children,
}) => {
  return (
    <Grid
      container
      style={{
        justifyContent: "flex-end",
      }}
    >
      {children}
    </Grid>
  );
};

export default AppDialogFooter;
