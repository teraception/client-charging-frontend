import { AuthSession } from "JS/Cognito/CognitoContextProvider";
import moment from "moment";
import { useRef, useState, useEffect, useMemo } from "react";

export function useAccessToken(notifyExpiry = false, session: AuthSession) {
  const timerRef = useRef<any>(null);
  const [expired, setExpired] = useState<boolean>(null);
  const token = useMemo<string>(() => {
    if (session) {
      return session.tokens.accessToken.toString();
    }
    return null;
  }, [session]);
  const expireTime = useMemo<number>(() => {
    if (session) {
      return session.tokens.accessToken.payload.exp;
    }
    return null;
  }, [session]);

  useEffect(() => {
    if (notifyExpiry) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      if (token && token !== "null") {
        setExpired(false);

        timerRef.current = setTimeout(() => {
          setExpired(true);
        }, (expireTime - moment().unix()) * 1000 + 500);
      }
    }
  }, [token, notifyExpiry, expireTime]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  return {
    expired,
    setExpired,
  };
}
