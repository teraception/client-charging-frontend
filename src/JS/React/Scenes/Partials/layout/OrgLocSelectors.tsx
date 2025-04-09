import { useEffect } from "react";

import { StandardProps } from "JS/React/Types/Style";
import { Grid, TextField, Theme } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import { useRouting } from "JS/React/Hooks/Routes";
import { useNavigate } from "react-router";
import { useOrganizations } from "JS/React/Hooks/Organizations";
import { useLocations } from "JS/React/Hooks/Locations";
import { processValidityState } from "JS/types";
import { useOrgLocContext } from "JS/Routing/Context/ActiveContextProvider";
import { useAccessHandler } from "JS/React/Hooks/AccessHandler";
import { StyleClassKey, makeStyles } from "JS/React/Style/styleHelper";

export type OrgLocSelectorClassKey = StyleClassKey<typeof useStyles>;

export interface OrgLocSelectorComponentProps
  extends StandardProps<{}, OrgLocSelectorClassKey> {}

const styles = (props: any, theme: Theme) => {
  return {};
};
const [useStyles, useEmotionStyles] =
  makeStyles<StyleClassKey<typeof styles>>(styles);

export const OrgLocSelectorComponent = (
  props: OrgLocSelectorComponentProps
) => {
  const { organizationId, locationId, updateLocationId, updateOrganizationId } =
    useOrgLocContext();
  const navigate = useNavigate();
  const { routeBuilder } = useRouting();
  const routeProvider = routeBuilder();
  const { organizations, fetchOrgResponse } = useOrganizations();
  const { canChangeOrgLoc, isSuperAdmin } = useAccessHandler();
  const { locations, fetchLocResponse } = useLocations();

  useEffect(() => {
    if (isSuperAdmin) {
      if (!organizationId) {
        updateOrganizationId(organizations && organizations[0]?.id);
      }
      if (!locationId) {
        updateLocationId(locations && locations[0]?.id);
      }
    }
  }, [isSuperAdmin, organizations, organizationId, locations, locationId]);

  useEffect(() => {
    if (fetchLocResponse) {
      processValidityState(fetchLocResponse?.validityState);
    }
    if (fetchOrgResponse) {
      processValidityState(fetchOrgResponse?.validityState);
    }
  }, [fetchLocResponse, fetchOrgResponse]);

  return (
    <Grid
      container
      xs={12}
      justifyContent={"space-between"}
      alignItems={"center"}
      spacing={4}
    >
      <Grid item xs={6}>
        <Autocomplete
          style={{ width: "200px" }}
          fullWidth
          id="tags-outlined"
          options={canChangeOrgLoc ? organizations || [] : []}
          getOptionLabel={(option) => option.name}
          filterSelectedOptions
          onChange={(e, values) => {
            updateOrganizationId(values?.id);
            navigate(routeProvider.react.dashboard());
          }}
          value={organizations?.find((x) => x.id === organizationId) || null}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Organization"
              placeholder="organization"
              variant="standard"
            />
          )}
        />
      </Grid>
      <Grid item xs={6}>
        <Autocomplete
          style={{ width: "200px" }}
          fullWidth
          id="tags-outlined"
          options={canChangeOrgLoc ? locations || [] : []}
          getOptionLabel={(option) => option.name}
          filterSelectedOptions
          onChange={(e, values) => {
            updateLocationId(values?.id);
            navigate(routeProvider.react.dashboard());
          }}
          value={locations?.find((x) => x.id === locationId) || null}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Location"
              placeholder="location"
              variant="standard"
            />
          )}
        />
      </Grid>
    </Grid>
  );
};
