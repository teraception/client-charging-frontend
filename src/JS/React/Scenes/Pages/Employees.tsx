import { Box, CircularProgress, Grid, IconButton, Theme } from "@mui/material";
import { StyleClassKey, makeStyles } from "JS/React/Style/styleHelper";
import { useEffect, useMemo, useState } from "react";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import { StandardProps } from "JS/React/Types/Style";
import { CreateEmployeeDialog } from "JS/React/Scenes/Partials/Employees/CreateEmployeeDialog";
import { useDeleteEmployee, useEmployees } from "JS/React/Hooks/Employees";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import { useNavigate } from "react-router-dom";
import AppButton from "JS/React/Components/AppButton";
import { processValidityState } from "JS/types";
import { StatusCode, User } from "@teraception/employee-management-lib";
import RenderWithConfirmation from "JS/React/Components/RenderWithConfirmation";
import { enqueueSnackbar } from "notistack";
import AppChip from "JS/React/Components/AppChip";

export type EmployeeComponentClassKey = StyleClassKey<typeof useStyles>;

export interface EmployeeComponentProps
  extends StandardProps<{}, EmployeeComponentClassKey> {}

const styles = (props: any, theme: Theme) => {
  return {};
};

const [useStyles, useEmotionStyles] =
  makeStyles<StyleClassKey<typeof styles>>(styles);
export const Employees = (props: EmployeeComponentProps) => {
  const navigate = useNavigate();
  const { employees, isLoading, getEmpsResponse } = useEmployees();

  const {
    deleteEmployee,
    isLoading: deleteEmployeeLoading,
    deleteEmpResponse,
  } = useDeleteEmployee();

  const [showCreateEmployeeDialog, setShowCreateEmployeeDialog] =
    useState<boolean>(false);

  useEffect(() => {
    processValidityState(getEmpsResponse?.validityState);
    processValidityState(deleteEmpResponse?.validityState);
  }, [getEmpsResponse, deleteEmpResponse]);

  const employeeTableCoulumns = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        enableHiding: false,
      },
      {
        accessorKey: "email",
        header: "Email",
        enableHiding: false,
      },
      {
        accessorKey: "phone",
        header: "Phone",
        enableHiding: false,
      },
      {
        accessorKey: "position",
        header: "Position",
        enableHiding: false,
      },
      {
        accessorKey: "role",
        header: "Role",
        enableHiding: false,
      },
      {
        accessorKey: "manager",
        header: "Manager",
        enableHiding: false,
      },
    ],
    [employees]
  );
  const employeesTableRows = useMemo(() => {
    return employees?.map((emp) => {
      return {
        id: emp?.id,
        name: emp?.name,
        email: (emp?.user as User)?.email,
        phone: emp?.contactInfo?.phoneNumber,
        position: emp?.position,
        role: (emp?.user as User)?.role?.map((x) => (
          <AppChip
            label={x}
            chipVariant="primary-fill"
            style={{ margin: "0 5px 0 5px" }}
          />
        )),
        manager: (emp?.manager as User)?.email,
      };
    });
  }, [employees]);

  const employeeTable = useMaterialReactTable({
    columns: employeeTableCoulumns,
    data: employeesTableRows || [],
    // enableRowSelection: true,
    // enableFilters: false,
    enableFullScreenToggle: false,
    enableColumnOrdering: true,
    enableGlobalFilter: false,
    initialState: { density: "compact" },
    muiPaginationProps: {
      rowsPerPageOptions: [25, 50, 100],
    },
    enableRowActions: true,
    positionActionsColumn: "last",
    renderTopToolbarCustomActions: () => {
      return (
        <Grid item xs={12} mb={2} display={"flex"} justifyContent={"start"}>
          <AppButton
            buttonVariant="emp-main"
            color="primary"
            onClick={() => {
              setShowCreateEmployeeDialog(true);
            }}
          >
            Create Employee
          </AppButton>
        </Grid>
      );
    },
    renderRowActions: ({ row }) => (
      <Box>
        <IconButton
          onClick={() => {
            navigate(`${row.original.id}`);
          }}
        >
          <EditIcon color="action" />
        </IconButton>
        <RenderWithConfirmation
          onConfirm={async () => {
            const response = await deleteEmployee(row.original.id);
            if (response.statusCode === StatusCode.SUCCESS) {
              enqueueSnackbar("employee deleted successfully", {
                variant: "success",
                autoHideDuration: 3000,
              });
            }
          }}
          dialogMessage="Are you sure you want to delete"
        >
          {(props) => (
            <IconButton
              onClick={() => {
                props.askConfirmation();
              }}
            >
              <DeleteIcon color="action" />
            </IconButton>
          )}
        </RenderWithConfirmation>
      </Box>
    ),
  });

  return (
    <Grid container xs={12}>
      <Grid item xs={12}>
        <MaterialReactTable table={employeeTable} />
      </Grid>
      {(isLoading || deleteEmployeeLoading) && (
        <CircularProgress
          style={{ position: "fixed", top: "50%", left: "50%" }}
        />
      )}
      {showCreateEmployeeDialog && (
        <CreateEmployeeDialog
          onClose={() => setShowCreateEmployeeDialog(false)}
        />
      )}
    </Grid>
  );
};
