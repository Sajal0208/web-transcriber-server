import agenda from "./agendaSingleton";

export const schedule = {
  deleteFileAfterExpire: async (data: any) => {
    console.log("Scheduling delete-file job");
    await agenda.schedule("in 2 seconds", "delete-file", data);
  },
};
