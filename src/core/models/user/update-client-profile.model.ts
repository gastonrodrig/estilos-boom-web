export const updateClientProfileModel = (file: File | null) => {
  const formData = new FormData();

  if (file) {
    formData.append("imageFile", file);
  }

  return formData;
};
