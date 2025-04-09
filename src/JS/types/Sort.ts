import { defaultTo, orderBy } from "lodash-es";

export type SortDirection = "asc" | "desc" | false;

export interface ColumnSort {
    col: string;
    dir?: SortDirection;
    position: number;
}

export type Sorting = ColumnSort[];

export function getColumnSort(sorting: Sorting, { col, position }: ColumnSort) {
    let spec = sorting.find((x) => x.col === col);
    if (!spec) {
        spec = {
            col,
            position,
            dir: null
        };
    }
    return spec;
}

export function addColumnSort(
    sort: ColumnSort,
    sorting: Sorting = []
): Sorting {
    sorting = defaultTo(sorting, []);
    const existingIndex = sorting.findIndex((s) => s.col === sort.col);
    if (existingIndex >= 0) {
        sort = {
            ...sort,
            position: sorting[existingIndex].position
        };
    }
    let spec = sorting.filter((s) => s.col !== sort.col);

    spec.push(sort);
    spec = spec
        .sort((pre, current) => {
            return pre.position === current.position
                ? 0
                : pre.position < current.position
                ? -1
                : 1;
        })
        .filter((a) => a.dir !== null);

    return spec;
}

export function sortData<T>(
    data: T[],
    orders: ColumnSort[],
    caseSensitive = false
): T[] {
    if (!data) {
        return [];
    }
    const filteredOrders = orders.filter((order) => order.dir !== null);
    return orderBy(
        data,
        caseSensitive
            ? filteredOrders.map(({ col }) => col)
            : filteredOrders.map(({ col }) => (item) => {
                  return typeof item[col] === "string" && item[col] !== undefined
                      ? item[col].toLowerCase()
                      : item[col];
              }),
        filteredOrders.map(({ dir }) => dir as "asc")
    );
}

export function getToggledSortDirection(
    currentDirection: SortDirection
): SortDirection {
    return currentDirection === "asc"
        ? "desc"
        : currentDirection === "desc"
        ? null
        : "asc";
}
