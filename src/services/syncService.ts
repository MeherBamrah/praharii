import NetInfo from "@react-native-community/netinfo";
import { database } from '../db'; // Assuming WatermelonDB or SQLite

export const syncAndPurge = async () => {
  const state = await NetInfo.fetch();

  if (state.isConnected) {
    const offlineLogs = await database.get('attendance_logs').query().fetch();

    for (const log of offlineLogs) {
      try {
        // Upload to AWS S3/Datalake
        const response = await fetch('YOUR_AWS_ENDPOINT', {
          method: 'POST',
          body: JSON.stringify(log),
        });

        if (response.status === 200) {
          // PURGE: Delete local record after successful sync
          await database.write(async () => {
            await log.destroyPermanently();
          });
        }
      } catch (error) {
        console.error("Sync failed for record:", log.id);
      }
    }
  }
};
