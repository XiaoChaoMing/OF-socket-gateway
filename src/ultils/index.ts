/* eslint-disable prettier/prettier */
import { generateToken04 } from './generateToken';
export const generateTokenZego = (userId: string) => {
  try {
    const appId = parseInt(process.env.NEXT_PUBLIC_ZEGO_APP_ID);
    const serverSecret = process.env.NEXT_PUBLIC_ZEGO_SERVER_SECRET;
    const userid = userId;
    const payload = '';
    const effectiveTimeInSeconds = 3600;
    if (appId && serverSecret && userid) {
      const token = generateToken04(
        appId,
        userid,
        serverSecret,
        effectiveTimeInSeconds,
        payload,
      );
      return token;
    }
    return null;
  } catch (error) {
    return error;
  }
};
