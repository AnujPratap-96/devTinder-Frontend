import { createPortal } from "react-dom";
import { useSelector } from "react-redux";
import { useCallContext } from "./CallProvider";
import IncomingCallSheet from "./IncomingCallSheet";
import OutgoingCallSheet from "./OutgoingCallSheet";
import InCallScreen from "./InCallScreen";

const CallOverlays = () => {
  const { status, direction } = useSelector((s) => s.call);
  const callApi = useCallContext();

  let content = null;
  if (status === "incoming") content = <IncomingCallSheet />;
  else if (direction === "out" && (status === "outgoing" || status === "connecting"))
    content = <OutgoingCallSheet />;
  else if (status === "active") content = <InCallScreen />;

  if (!content) return null;
  return createPortal(content, document.body);
};

export default CallOverlays;
