
//standard pagiation strucutre
export interface Pagination{
    limit: number;
    page: number;
    pages: number;
    total: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}