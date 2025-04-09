import { useMemo } from "react";
import Select, { components } from "react-select";
import SearchIcon from "@mui/icons-material/Search";
import makeAnimated from "react-select/animated";
import CreatableSelect from "react-select/creatable";
import clsx from "clsx";
import { Grid, Theme, Typography } from "@mui/material";
import { css } from "@emotion/react";
import { StyleClassKey, makeStyles } from "JS/React/Style/styleHelper";
import { FieldState } from "JS/types";

const styles = (props: any, theme: Theme) => {
  return {
    root: css({}),
    chip: css({
      marginLeft: "4px",
      marginTop: "8px",
      height: "25px",
      paddingLeft: "2px",
      paddingRight: "2px",
      backgroundColor: "#252935",
    }),
    placeholderIconStyle: css({
      position: "absolute",
      top: "3px",
      left: "30px",
      whiteSpace: "nowrap",
    }),
  };
};

const [useStyles, useEmotionStyles] =
  makeStyles<StyleClassKey<typeof styles>>(styles);

const IndicatorsContainer = () => {
  return <div></div>;
};
// const ValueContainer = () => {
//     return <div></div>;
// };

const colourStyles = {
  control: (styles) => ({
    ...styles,
    backgroundColor: "white",
    padding: "5px",
    maxHeight: "247px",
    overflowY: "auto",
    paddingLeft: "20px",
    boxShadow: "0px 10px 10px rgba(204, 204, 204,0.2)",
  }),
  option: (styles, { data, isDisabled, isFocused, isSelected }) => {
    return {
      ...styles,
      backgroundColor: isDisabled
        ? null
        : isSelected
        ? "#EBEBEB"
        : isFocused
        ? "#ccc"
        : null,
      color: "black",
      cursor: isDisabled ? "not-allowed" : "default",
      borderRadius: 3,
      borderBottom: "1px solid white",
      ":active": {
        ...styles[":active"],
        backgroundColor: "#ccc",
      },
    };
  },
  multiValue: (styles, { data }) => {
    return {
      ...styles,
      backgroundColor: "#252935",
      padding: "0 8px",
      borderRadius: "25px",
      ":hover": {
        backgroundColor: "#252935",
      },
    };
  },
  multiValueLabel: (styles, { data }) => ({
    ...styles,
    color: "white",
  }),
  multiValueRemove: (styles, { data }) => ({
    ...styles,
    color: "white",
    ":hover": {
      color: "white",
    },
  }),
};

const ReactSelectCustom = (props) => {
  if (props.allowSelectAll) {
    return (
      <Select
        {...props}
        options={[props.allOption, ...props.options]}
        menuPortalTarget={document.body}
        menuPosition={"absolute"}
        menuPlacement={"bottom"}
        menuShouldScrollIntoView={false}
        onChange={(selected) => {
          if (
            selected !== null &&
            (selected as any).length > 0 &&
            selected[(selected as any).length - 1].value ===
              props.allOption.value
          ) {
            return props.onChange(props.options);
          }
          return props.onChange(selected);
        }}
      />
    );
  }

  return <Select {...props} />;
};

ReactSelectCustom.defaultProps = {
  allOption: {
    label: "Select all",
    value: "*",
  },
};

const animatedComponents = makeAnimated();
export interface SelectComponentProps {
  options: { value: any; label: string }[];
  selectedValues: any[] | any;
  description?: string;
  title: string;
  placeholder: string;
  onChange: (values: any[] | any) => void;
  allowSelectAll?: boolean;
  creatable?: boolean;
  isMulti?: boolean;
  errorInfo?: FieldState;
  showPlaceholderIcon?: boolean;
}

export const SelectComponent = (props: SelectComponentProps) => {
  const classes = useStyles();
  const {
    creatable = false,
    isMulti = true,
    showPlaceholderIcon = true,
    errorInfo = null,
  } = props;

  const Placeholder = (prop: any) => {
    return (
      <components.Placeholder {...prop}>
        {showPlaceholderIcon && <SearchIcon />}
        <span
          className={clsx({
            [classes.placeholderIconStyle]: !!showPlaceholderIcon,
          })}
        >
          {props.placeholder}
        </span>
      </components.Placeholder>
    );
  };

  const chipData = useMemo(() => {
    if (props && props.selectedValues && Array.isArray(props.selectedValues)) {
      return props.selectedValues
        .map((v) => props.options?.find((x) => x.value == v))
        .filter((a) => a);
    } else if (props && props.selectedValues) {
      return props.selectedValues;
    }
  }, [props.options, props.selectedValues]);

  const handleDelete = (value: any) => () => {
    props.onChange(props.selectedValues.filter((x) => x != value));
  };
  const clearSelection = () => {
    props.onChange([]);
  };
  const handleChange = (selectedOptions) => {
    if (selectedOptions === null) {
      props.onChange([]);
    } else if (selectedOptions && Array.isArray(selectedOptions)) {
      props.onChange(selectedOptions.map((x) => x.value));
    } else if (selectedOptions) {
      props.onChange(selectedOptions);
    }
  };

  return (
    <>
      <Grid
        container
        direction="row"
        style={{ paddingBottom: "3px" }}
        alignContent="space-between"
      >
        <Grid item xs={6}>
          <Typography
            variant="body1"
            style={{ paddingLeft: "3px", fontSize: "15px" }}
          >
            {props.title}
          </Typography>
        </Grid>
        <Grid item xs={6} style={{ textAlign: "right" }}>
          <Typography
            style={{
              color: "#00A8A3",
              textDecoration: "underline",
              cursor: "pointer",
              fontSize: "14px",
            }}
            onClick={clearSelection}
          >
            Clear Selection
          </Typography>
        </Grid>
      </Grid>
      {props.creatable ? (
        <CreatableSelect
          closeMenuOnSelect={true}
          options={props.options}
          components={{
            Placeholder,
            IndicatorsContainer,
          }}
          isMulti={isMulti}
          onChange={handleChange}
          value={chipData}
          style={{
            minHeight: "200px",
            boxShadow: "5px 10px 18px #888888",
            borderColor: "#00A8A3",
          }}
          theme={(theme) => ({
            ...theme,
            colors: {
              ...theme.colors,
              primary: "#00A8A3",
            },
          })}
          styles={colourStyles}
        />
      ) : (
        <ReactSelectCustom
          closeMenuOnSelect={false}
          creatable={props.creatable}
          options={props.options}
          components={{
            Placeholder,
            IndicatorsContainer,
            // MultiValueContainer: ValueContainer,
            animatedComponents,
          }}
          isMulti={isMulti}
          allowSelectAll={props.allowSelectAll}
          hideSelectedOptions={false}
          onChange={handleChange}
          value={chipData}
          style={{
            minHeight: "200px",
            boxShadow: "5px 10px 18px #888888",
          }}
          theme={(theme) => ({
            ...theme,
            colors: {
              ...theme.colors,
              primary: "#00A8A3",
            },
          })}
          styles={colourStyles}
        />
      )}
      <Grid container style={{ paddingTop: "5px", paddingBottom: "5px" }}>
        <Typography variant="body2" style={{ paddingLeft: "3px" }}>
          {props.description}
        </Typography>
      </Grid>
      <Typography
        style={{ fontSize: "0.75rem", margin: "2px 2px 0px" }}
        color="error"
      >
        {errorInfo && errorInfo.errors.length > 0
          ? errorInfo.errors[0].message
          : ""}
      </Typography>{" "}
      {/* {chipData.map(data => {
                return (
                    <Chip
                        key={data.value}
                        label={data.label}
                        onDelete={handleDelete(data.value)}
                        className={classes.chip}
                        clickable={false}
                        color="primary"
                        variant="default"
                        deleteIcon={<ClearIcon style={{ width: "16px" }} />}
                    />
                );
            })} */}
    </>
  );
};
