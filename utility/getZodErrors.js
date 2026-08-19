export const getZodErrors = (error) => {
  return error.issues.map((issue) => ({
    field: issue.path.join("."),
    message: issue.message,
  }));
};