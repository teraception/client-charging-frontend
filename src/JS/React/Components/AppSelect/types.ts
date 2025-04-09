import { FixedSizeListProps } from "react-window";
import { CustomSelectClassKey, CustomSelectProps } from "./CustomSelect";
import { Props } from "react-select/src";
import { AsyncProps } from "react-select/async";
import { CreatableProps } from "react-select/creatable";
import { Subtract } from "utility-types";

export interface CustomSelectComponentSelectProps {
    classes: Partial<Record<CustomSelectClassKey, string>>;
    controlProps: {
        fullWidth: boolean;
        allowReload: boolean;
        onReload: () => void;
    };
    fixedSizeListProps: FixedSizeListProps;
}

export type SelectComponentProps<ComponentProps> = Pick<
    ComponentProps,
    Exclude<keyof ComponentProps, "selectProps">
> & {
    selectProps: CustomSelectComponentSelectProps;
};

export interface SimpleOption {
    [index: string]: any;
    label?: string | number;
    value?: any;
}

export type SelectProps<OptionType> = Props<OptionType>;
export type AsyncSelectProps<OptionType> = AsyncProps<OptionType> &
    Props<OptionType>;
export type CreatableSelectProps<OptionType> = CreatableProps<OptionType> &
    Props<OptionType>;
export type AsyncCreatableSelectProps<OptionType> = AsyncProps<OptionType> &
    CreatableProps<OptionType> &
    Props<OptionType>;

export type ComposedSelect<TProps, TOption> = Subtract<
    CustomSelectProps<TProps, TOption>,
    {
        Component;
    }
>;
