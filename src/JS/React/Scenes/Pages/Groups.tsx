import { CircularProgress, Grid, Theme, Tooltip } from "@mui/material";
import { Box, IconButton } from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import { useAllGroups, useDeleteGroup } from "JS/React/Hooks/Groups";

import { StandardProps } from "JS/React/Types/Style";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router";
import CreateUpdateGroupDialog from "JS/React/Scenes/Partials/Groups/CreateUpdateGroupDialog";
import { StyleClassKey, makeStyles } from "JS/React/Style/styleHelper";
import AppButton from "JS/React/Components/AppButton";
import { AssignLeavePolicyToGroupDialog } from "JS/React/Scenes/Partials/Groups/AssignLeavePolicyToGroupDialog";
import { AssignFeedbackPolicyToGroupDialog } from "JS/React/Scenes/Partials/Groups/AssignFeedbackPolicyToGroupDialog";
import { AssignIncrementalPolicyToGroupDialog } from "JS/React/Scenes/Partials/Groups/AssignIncrementalPolicyToGroupDialog";
import { processValidityState } from "JS/types";
import { enqueueSnackbar } from "notistack";
import RenderWithConfirmation from "JS/React/Components/RenderWithConfirmation";
import PlusOneIcon from "@mui/icons-material/PlusOne";
import GradingIcon from "@mui/icons-material/Grading";
import GroupRemoveIcon from "@mui/icons-material/GroupRemove";
import { StatusCode } from "@teraception/employee-management-lib";

export type GroupComponentClassKey = StyleClassKey<typeof useStyles>;
export interface GroupComponentProps
  extends StandardProps<{}, GroupComponentClassKey> {}
const styles = (props: any, theme: Theme) => {
  return {};
};
const [useStyles, useEmotionStyles] =
  makeStyles<StyleClassKey<typeof styles>>(styles);

export const Groups: React.FC = (props: GroupComponentProps) => {
  const {} = props;
  const classes = useStyles(props);

  const navigate = useNavigate();
  const { groups, isLoading, getAllGroupsResponse } = useAllGroups();
  const {
    deleteGroupById,
    isLoading: deletingGroupLoader,
    deleteGroupResponse,
  } = useDeleteGroup();

  useEffect(() => {
    processValidityState(deleteGroupResponse?.validityState);
    processValidityState(getAllGroupsResponse?.validityState);
  }, [deleteGroupResponse, getAllGroupsResponse]);

  const [showCreateUpdateGroupModal, setShowCreateUpdateGroupModal] =
    useState(false);
  const [showAssignLeavePolicyGroupModal, setShowAssignLeavePolicyGroupModal] =
    useState(false);
  const [
    showAssignFeedbackPolicyGroupModal,
    setShowAssignFeedbackPolicyGroupModal,
  ] = useState(false);
  const [
    showAssignIncrementalPolicyGroupModal,
    setShowAssignIncrementalPolicyGroupModal,
  ] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string>(null);
  const groupTableColumns = useMemo(() => {
    return [
      {
        header: "Name",
        accessorKey: "name",
      },
      {
        header: "Policy Assignment",
        accessorKey: "policyAssignment",
        Cell: ({ row }) => {
          return (
            <Box>
              <Tooltip title="Assign Leave Policy" placement="top">
                <IconButton
                  onClick={() => {
                    setSelectedGroupId(row.original.id);
                    setShowAssignLeavePolicyGroupModal(true);
                  }}
                >
                  <GroupRemoveIcon color="action" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Assign Feedback Policy" placement="top">
                <IconButton
                  onClick={() => {
                    setSelectedGroupId(row.original.id);
                    setShowAssignFeedbackPolicyGroupModal(true);
                  }}
                >
                  <GradingIcon color="action" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Assign Incremental Policy" placement="top">
                <IconButton
                  onClick={() => {
                    setSelectedGroupId(row.original.id);
                    setShowAssignIncrementalPolicyGroupModal(true);
                  }}
                >
                  <PlusOneIcon color="action" />
                </IconButton>
              </Tooltip>
            </Box>
          );
        },
      },
    ];
  }, []);
  const groupTableData = useMemo(() => {
    return groups?.map((x) => {
      return {
        id: x?.id,
        name: x?.name,
      };
    });
  }, [groups]);

  const groupsTable = useMaterialReactTable({
    columns: groupTableColumns,
    data: groupTableData || [],
    enableRowActions: true,
    positionActionsColumn: "last",
    enableFullScreenToggle: false,
    renderTopToolbarCustomActions: () => {
      return (
        <Grid item xs={12} mb={2} display={"flex"} justifyContent={"start"}>
          <AppButton
            buttonVariant="emp-main"
            color="primary"
            onClick={() => setShowCreateUpdateGroupModal(true)}
          >
            create group
          </AppButton>
        </Grid>
      );
    },
    initialState: { density: "compact" },
    renderRowActions: ({ row }) => (
      <Box>
        <IconButton
          onClick={() => {
            setSelectedGroupId(row.original.id);
            setShowCreateUpdateGroupModal(true);
          }}
        >
          <EditIcon color="action" />
        </IconButton>
        <RenderWithConfirmation
          onConfirm={async () => {
            const response = await deleteGroupById(row.original.id);
            if (response.statusCode === StatusCode.SUCCESS) {
              enqueueSnackbar("Group deleted successfully", {
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
        <MaterialReactTable table={groupsTable} />
      </Grid>
      {showCreateUpdateGroupModal && (
        <CreateUpdateGroupDialog
          onClose={() => {
            setShowCreateUpdateGroupModal(false);
            setSelectedGroupId(null);
          }}
          editGroupId={selectedGroupId}
        />
      )}
      {showAssignLeavePolicyGroupModal && (
        <AssignLeavePolicyToGroupDialog
          onClose={() => setShowAssignLeavePolicyGroupModal(false)}
          selectedGroupId={selectedGroupId}
        />
      )}
      {showAssignFeedbackPolicyGroupModal && (
        <AssignFeedbackPolicyToGroupDialog
          onClose={() => setShowAssignFeedbackPolicyGroupModal(false)}
          selectedGroupId={selectedGroupId}
        />
      )}
      {showAssignIncrementalPolicyGroupModal && (
        <AssignIncrementalPolicyToGroupDialog
          onClose={() => setShowAssignIncrementalPolicyGroupModal(false)}
          selectedGroupId={selectedGroupId}
        />
      )}
      {(isLoading || deletingGroupLoader) && (
        <CircularProgress
          style={{ position: "fixed", top: "50%", left: "50%" }}
        />
      )}
    </Grid>
  );
};
export default Groups;
