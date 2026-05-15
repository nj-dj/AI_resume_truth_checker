export const formatApiError = (error) => {
  if (error.response?.data?.message) {
    const details = error.response.data.details;
    const detailMessage =
      typeof details === "object" && details !== null
        ? details.cause || details.message || JSON.stringify(details)
        : details;
    return detailMessage ? `${error.response.data.message}: ${detailMessage}` : error.response.data.message;
  }

  return error.message || "Request failed";
};
