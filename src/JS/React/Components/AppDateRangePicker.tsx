import {
  addDays,
  endOfMonth,
  endOfQuarter,
  endOfWeek,
  isSameDay,
  startOfDay,
  startOfMonth,
  startOfQuarter,
  startOfWeek,
  subDays,
  subHours,
  subMonths,
  subQuarters,
} from "date-fns";
import dayjs from "dayjs";
import React, { useMemo } from "react";
import { DateRangePicker, Range, createStaticRanges } from "react-date-range";
import "react-date-range/dist/styles.css"; // main style file
import "react-date-range/dist/theme/default.css"; // theme css file

export interface DateRange {
  startDate: number;
  endDate: number;
}

interface AppDateRangeProps {
  range?: DateRange;
  maxDate?: string;
  minDate?: string;
  ranges?: RangeSpec[];
  setDateRange: (range: DateRange) => void;
}

export const DateSelectionRanges = {
  last24Hours: subHours(new Date(), 24),
  last7Days: subDays(new Date(), 6),
  last1Month: subMonths(new Date(), 1),
  last3Month: subMonths(new Date(), 3),
  last6Month: subMonths(new Date(), 6),
  startOfToday: startOfDay(new Date()),
  startOfCurrentMonth: startOfMonth(new Date()),
  endOfCurrentMonth: endOfMonth(new Date()),
  startOfPreviousMonth: subMonths(startOfMonth(new Date()), 1),
  endOfPreviousMonth: subMonths(endOfMonth(new Date()), 1),
  startOfPreviousWeek: subDays(startOfWeek(new Date()), 6),
  endOfPreviousWeek: subDays(endOfWeek(new Date()), 6),
  startOfCurrentWeek: startOfWeek(new Date(), { weekStartsOn: 1 }),
  endOfCurrentWeek: addDays(endOfWeek(new Date()), 1),
  currentQuarterLastDay: endOfQuarter(new Date()),
  previousQuarterLastDay: endOfQuarter(
    startOfQuarter(subQuarters(new Date(), 1))
  ),
  startOfCurrentQuarter: startOfQuarter(new Date()),
  startOfPreviousQuarter: startOfQuarter(subQuarters(new Date(), 1)),
};

export interface RangeSpec {
  label: string;
  range: {
    startDate: Date;
    endDate: Date;
  };
}

export enum Ranges {
  LAST_24_HOURS = "Last 24 Hours",
  LAST_7_DAYS = "Last 7 Days",
  LAST_1MONTH = "Last 1 Month",
  LAST_3MONTHS = "Last 3 Months",
  LAST_6MONTHS = "Last 6 Months",
  PREVIOUS_MONTH = "Previous Month",
  PREVIOUS_WEEK = "Previous Week",
  PREVIOUS_QUARTER = "Previous Quarter",
  CURRENT_MONTH = "Current Month",
  CURRENT_WEEK = "Current Week",
  CURRENT_QUARTER = "Current Quarter",
}

export const defaultRanges: RangeSpec[] = [
  {
    label: Ranges.LAST_24_HOURS,
    range: {
      startDate: DateSelectionRanges.last24Hours,
      endDate: DateSelectionRanges.startOfToday,
    },
  },
  {
    label: Ranges.LAST_7_DAYS,
    range: {
      startDate: DateSelectionRanges.last7Days,
      endDate: DateSelectionRanges.startOfToday,
    },
  },
  {
    label: Ranges.LAST_1MONTH,
    range: {
      startDate: DateSelectionRanges.last1Month,
      endDate: DateSelectionRanges.startOfToday,
    },
  },
  {
    label: Ranges.LAST_3MONTHS,
    range: {
      startDate: DateSelectionRanges.last3Month,
      endDate: DateSelectionRanges.startOfToday,
    },
  },
  {
    label: Ranges.LAST_6MONTHS,
    range: {
      startDate: DateSelectionRanges.last6Month,
      endDate: DateSelectionRanges.startOfToday,
    },
  },
  {
    label: Ranges.PREVIOUS_MONTH,
    range: {
      startDate: DateSelectionRanges.startOfPreviousMonth,
      endDate: DateSelectionRanges.endOfPreviousMonth,
    },
  },
  {
    label: Ranges.PREVIOUS_WEEK,
    range: {
      startDate: DateSelectionRanges.startOfPreviousWeek,
      endDate: DateSelectionRanges.endOfPreviousWeek,
    },
  },
  {
    label: Ranges.PREVIOUS_QUARTER,
    range: {
      startDate: DateSelectionRanges.startOfPreviousQuarter,
      endDate: DateSelectionRanges.previousQuarterLastDay,
    },
  },
  {
    label: Ranges.CURRENT_MONTH,
    range: {
      startDate: DateSelectionRanges.startOfCurrentMonth,
      endDate: DateSelectionRanges.endOfCurrentMonth,
    },
  },
  {
    label: Ranges.CURRENT_WEEK,
    range: {
      startDate: DateSelectionRanges.startOfCurrentWeek,
      endDate: DateSelectionRanges.endOfCurrentWeek,
    },
  },
  {
    label: Ranges.CURRENT_QUARTER,
    range: {
      startDate: DateSelectionRanges.startOfCurrentQuarter,
      endDate: DateSelectionRanges.currentQuarterLastDay,
    },
  },
];

export const AppDateRangePicker: React.FC<AppDateRangeProps> = ({
  range,
  maxDate,
  minDate,
  ranges = defaultRanges,
  setDateRange,
}) => {
  const SameDateRangeCheck = (
    newRange: Range,
    oldRange: Range,
    label: string
  ): boolean => {
    if (
      isSameDay(newRange.startDate, oldRange.startDate) &&
      isSameDay(newRange.endDate, oldRange.endDate)
    ) {
      return true;
    }
  };
  const sideBarOptions = () => {
    const customDateObjects = ranges.map((range) => ({
      label: range.label,
      range: () => range.range,
      isSelected(range) {
        return SameDateRangeCheck(range, this.range(), this.label);
      },
    }));
    return customDateObjects;
  };

  const selected = useMemo(() => {
    return [
      {
        startDate: dayjs(range.startDate).toDate(),
        endDate: dayjs(range.endDate).toDate(),
        key: "selection",
      },
    ];
  }, [range]);

  return (
    <DateRangePicker
      showPreview={true}
      moveRangeOnFirstSelection={false}
      months={1}
      maxDate={maxDate ? dayjs(maxDate).toDate() : undefined}
      minDate={minDate ? dayjs(minDate).toDate() : undefined}
      direction="horizontal"
      staticRanges={createStaticRanges(sideBarOptions())}
      ranges={selected}
      onChange={(item) => {
        const range = ("selection" in item ? item.selection : item) as Range;
        setDateRange({
          endDate: dayjs(range.endDate).valueOf(),
          startDate: dayjs(range.startDate).valueOf(),
        });
      }}
    />
  );
};
export default AppDateRangePicker;
