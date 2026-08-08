import { createContext, useContext } from "react";
import { useCall } from "../../hooks/useCall";
import CallOverlays from "./CallOverlays";

const CallContext = createContext(null);

export const CallProvider = ({ children }) => {
  const callApi = useCall();
  return (
    <CallContext.Provider value={callApi}>
      {children}
      <CallOverlays />
    </CallContext.Provider>
  );
};

export const useCallContext = () => {
  const ctx = useContext(CallContext);
  if (!ctx) throw new Error("useCallContext must be used within CallProvider");
  return ctx;
};
