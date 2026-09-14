import { createPortal } from "react-dom";
import { useSelector } from "react-redux";
import IncomingCallSheet from "./IncomingCallSheet";
import OutgoingCallSheet from "./OutgoingCallSheet";
import InCallScreen from "./InCallScreen";

const CallOverlays = () => {
  const { status } = useSelector((s) => s.call);

  // Both sides land on the call screen as soon as they start connecting;
  // otherwise the callee sees a black gap between tapping "accept" and the
  // call actually starting.
  let content = null;
  if (status === "incoming") content = <IncomingCallSheet />;
  else if (status === "outgoing") content = <OutgoingCallSheet />;
  else if (status === "connecting" || status === "active") content = <InCallScreen />;

  if (!content) return null;
  return createPortal(content, document.body);
};

export default CallOverlays;
