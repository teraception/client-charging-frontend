import Box from "@mui/material/Box";
import Slider from "@mui/material/Slider";
import { Theme } from "@mui/material";
import { css } from "@emotion/react";
import { StandardProps } from "JS/React/Types/Style";
import { StyleClassKey, makeStyles } from "JS/React/Style/styleHelper";

const styles = (props: any, theme: Theme) => {
  return {
    root: css({}),
  };
};

const [useStyles, useEmotionStyles] =
  makeStyles<StyleClassKey<typeof styles>>(styles);

export type AppRangeSliderKey = StyleClassKey<typeof useStyles>;

export interface AppRangeSliderProps
  extends StandardProps<{}, AppRangeSliderKey> {
  value: number | number[];
  handleChange: (event: Event, newValue: number | number[]) => void;
}

function valuetext(value: number) {
  return `${value}`;
}

export default function AppRangeSlider(props: AppRangeSliderProps) {
  const classes = useStyles(props);
  const { value, handleChange } = props;

  return (
    <Box sx={{ width: 300 }}>
      <Slider
        value={value}
        onChange={handleChange}
        valueLabelDisplay="auto"
        getAriaValueText={valuetext}
      />
    </Box>
  );
}
