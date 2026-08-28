import api from "./api";

/*
|--------------------------------------------------------------------------
| GET ALL INCIDENTS
|--------------------------------------------------------------------------
*/
export const getIncidents = async () => {
  const response = await api.get("/incidents");

  return response.data;
};

/*
|--------------------------------------------------------------------------
| GET SINGLE INCIDENT
|--------------------------------------------------------------------------
*/
export const getIncident = async (incidentId) => {
  const response = await api.get(
    `/incidents/${incidentId}`
  );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| CREATE INCIDENT
|--------------------------------------------------------------------------
*/
export const createIncident = async (incidentData) => {
  const response = await api.post(
    "/incidents",
    incidentData
  );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| UPDATE INCIDENT
|--------------------------------------------------------------------------
*/
export const updateIncident = async (
  incidentId,
  updates
) => {
  const response = await api.patch(
    `/incidents/${incidentId}`,
    updates
  );

  return response.data;
};

/*
|--------------------------------------------------------------------------
| DELETE INCIDENT
|--------------------------------------------------------------------------
*/
export const deleteIncident = async (incidentId) => {
  const response = await api.delete(
    `/incidents/${incidentId}`
  );

  return response.data;
};
/*
|--------------------------------------------------------------------------
| AI INVESTIGATE INCIDENT
|--------------------------------------------------------------------------
*/
export const investigateIncident = async (incidentId) => {
  const response = await api.post(
    `/ai/investigate/${incidentId}`
  );

  return response.data;
};
