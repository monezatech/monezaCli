import { useEffect } from "react";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import apiCall from "../service/api";

const useFCM = (userToken) => {
  const getFcmToken = async () => {
    try {
      const authStatus = await getMessaging().requestPermission();
      const enabled =
        authStatus === getMessaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === getMessaging.AuthorizationStatus.PROVISIONAL;

      if (!enabled) {
        console.warn("FCM permission not granted.");
        return;
      }

      const fcmToken = await getMessaging().getToken();
      console.log("FCM Token:", fcmToken);

      if (fcmToken) {
        await apiCall("/api/save-token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
          body: JSON.stringify({ fcmToken }),
        });
      }
    } catch (error) {
      console.error("FCM error:", error);
    }
  };
  useEffect(() => {
    getFcmToken();
  }, [userToken]);
};

export default useFCM;
