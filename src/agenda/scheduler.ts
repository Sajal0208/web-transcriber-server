import agenda from "./agendaSingleton";

export const schedule = {
  deleteFileAfterExpire: async (data: any) => {
    console.log("Scheduling delete-file job");
    await agenda.schedule("in 10 minutes", "delete-file", data);
  },
};
