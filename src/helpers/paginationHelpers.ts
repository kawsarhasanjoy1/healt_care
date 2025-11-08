type TOptions = {
    page?: number,
    limit?: number,
    sortOrder?: string,
    sortBy?: string
}

export const calculatePagination = (options: TOptions ) => {
const page = Number(options?.page) || 1;
const limit = Number(options?.limit) || 5;
const skip = (page - 1) * limit;
const sortBy = (options?.sortBy) || 'createdAt';
const sortOrder = (options?.sortOrder) || 'desc';
return {
    page,
    limit,
    skip,
    sortBy,
    sortOrder,
}
}