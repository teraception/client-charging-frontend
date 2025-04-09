import React, { useEffect, useMemo, useState } from "react";
import { CreateUpdatePolicyModal } from "../Partials/IncrementalPolicy/CreateUpdatePolicyModal";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AppButton from "JS/React/Components/AppButton";
import { Box, CircularProgress, Grid, IconButton, Theme } from "@mui/material";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";

import { StandardProps } from "JS/React/Types/Style";
import { StyleClassKey, makeStyles } from "JS/React/Style/styleHelper";
import { processValidityState } from "JS/types";
import { enqueueSnackbar } from "notistack";
import RenderWithConfirmation from "JS/React/Components/RenderWithConfirmation";
import {
  useDeleteIncrementalPolicy,
  useGetIncrementalPolicies,
} from "JS/React/Hooks/Policies/IncrementalPolicyHook";
import { StatusCode } from "@teraception/employee-management-lib";

export type IncrementalPolicyClassKey = StyleClassKey<typeof useStyles>;
export interface IncrementalPolicyProps
  extends StandardProps<{}, IncrementalPolicyClassKey> {}

const styles = (props: any, theme: Theme) => {
  return {};
};
const [useStyles, useEmotionStyles] =
  makeStyles<StyleClassKey<typeof styles>>(styles);
export const IncrementalPolicy: React.FC<IncrementalPolicyProps> = (
  props: IncrementalPolicyProps
) => {
  const {
    deleteIncrementalPolicy,
    deleteIncrementalPolicyLoading,
    deleteIncrementalPolicyResponse,
  } = useDeleteIncrementalPolicy();
  const { isLoading, incrementalPolicyResponse, incrementalPolicies } =
    useGetIncrementalPolicies();
  const [showCreateUpdatePolicyModal, setShowCreateUpdatePolicyModal] =
    useState<boolean>(false);
  const [editPolicy, setEditPolicy] = useState<string>(null);
  const incrementalPolicyColumns = useMemo(
    () => [
      {
        accessorKey: "organization",
        header: "Organization",
        enableHiding: false,
      },
      {
        accessorKey: "noOfDays",
        header: "No. Days",
        enableHiding: false,
      },
    ],
    []
  );
  const incrementalPolicyTabelData = useMemo(() => {
    return incrementalPolicies?.map((x) => {
      return {
        id: x?.id,
        organization: x?.organization?.name,
        noOfDays: x?.numberOfDays,
      };
    });
  }, [incrementalPolicies]);

  useEffect(() => {
    if (incrementalPolicyResponse?.validityState.length) {
      processValidityState(incrementalPolicyResponse?.validityState);
    }
    if (deleteIncrementalPolicyResponse?.validityState.length) {
      processValidityState(deleteIncrementalPolicyResponse?.validityState);
    }
  }, [incrementalPolicyResponse, deleteIncrementalPolicyResponse]);

  const IncrementalPolicyTable = useMaterialReactTable({
    columns: incrementalPolicyColumns,
    data: incrementalPolicyTabelData || [],
    // enableRowSelection: true,
    enableColumnOrdering: true,
    enableFullScreenToggle: false,
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
              setEditPolicy(null);
              setShowCreateUpdatePolicyModal(true);
            }}
          >
            Create Increment Policy
          </AppButton>
        </Grid>
      );
    },
    renderRowActions: ({ row }) => (
      <Box>
        <IconButton
          onClick={() => {
            setEditPolicy(row.original?.id);
            setShowCreateUpdatePolicyModal(true);
          }}
        >
          <EditIcon color="action" />
        </IconButton>
        <RenderWithConfirmation
          onConfirm={async () => {
            const response = await deleteIncrementalPolicy(
              row.original?.id as any
            );
            if (response.statusCode === StatusCode.SUCCESS) {
              enqueueSnackbar("incremental policy deleted successfully", {
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
        <MaterialReactTable table={IncrementalPolicyTable} />
      </Grid>
      {showCreateUpdatePolicyModal && (
        <CreateUpdatePolicyModal
          isOpen={showCreateUpdatePolicyModal}
          onClose={() => {
            setShowCreateUpdatePolicyModal(false);
          }}
          policyId={editPolicy}
        />
      )}
      {(isLoading || deleteIncrementalPolicyLoading) && (
        <CircularProgress
          style={{ position: "fixed", top: "50%", left: "50%", zIndex: 999 }}
        />
      )}
    </Grid>
  );
};
export default IncrementalPolicy;
