import React from "react";

export interface LayoutContextSetting {
    paddingEnabled: boolean;
    setContentHeight: boolean;
    contentClass?: string;
    hideScroll?: boolean;
}

export interface LayoutContextSettingActions {
    reset: () => void;
    set: (value: Partial<LayoutContextSetting>) => void;
}

export type LayoutContextValue = LayoutContextSetting &
    LayoutContextSettingActions;

export const LayoutContext = React.createContext<LayoutContextValue>(null);

export function getLayoutContextDefault(): LayoutContextSetting {
    return {
        paddingEnabled: true,
        setContentHeight: false,
    };
}
