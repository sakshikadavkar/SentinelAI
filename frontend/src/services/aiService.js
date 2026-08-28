import api from "./api";

export const investigateIncident = async (incidentId) => {
  const response = await api.post(
    `/ai/investigate/${incidentId}`
  );

  return response.data;
};