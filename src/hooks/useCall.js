import { useCallback, useEffect, useRef, useState } from "react";
import { useSelector, useDispatch, useStore } from "react-redux";
import { createSocketConnection } from "../utils/constant";
import callClient from "../utils/callClient";
import { useToast } from "../context/ToastProvider";
import {
  startOutgoing,
  setIncoming,
  setStatus,
  setCallId,
  toggleMute as toggleMuteAction,
  toggleCamera as toggleCameraAction,
  setError,
  resetCall,
} from "../store/callSlice";

export const useCall = () => {
  const user = useSelector((s) => s.user);
  const status = useSelector((s) => s.call.status);
  const dispatch = useDispatch();
  const store = useStore();
  const { addToast } = useToast();
  const socketRef = useRef(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  useEffect(() => {
    if (!user?._id) return undefined;
    const socket = createSocketConnection(user._id);
    socketRef.current = socket;

    callClient.setHandlers({
      onRemote: (stream) => setRemoteStream(stream),
      onIce: (candidate) => {
        const { callId } = store.getState().call;
        if (callId) socket.emit("call:ice-candidate", { callId, candidate });
      },
      onState: (state) => {
        if (state === "failed" || state === "disconnected") {
          dispatch(setStatus("connecting"));
        }
      },
    });

    const getCtx = () => store.getState().call;

    const onCreated = ({ callId }) => dispatch(setCallId(callId));

    const onInvite = (p) => dispatch(setIncoming(p));

    const onAccept = async () => {
      try {
        const { callId, type } = getCtx();
        const ice = await callClient.fetchIceServers();
        const stream = await callClient.getMedia(type);
        setLocalStream(stream);
        await callClient.createPeer(ice);
        const offer = await callClient.makeOffer();
        socket.emit("call:offer", { callId, sdp: offer });
        dispatch(setStatus("connecting"));
      } catch (err) {
        addToast(err?.message || "Could not start call", "error");
        callClient.close();
        dispatch(resetCall());
      }
    };

    const onOffer = async ({ callId, sdp }) => {
      try {
        const { type } = getCtx();
        const ice = await callClient.fetchIceServers();
        const stream = await callClient.getMedia(type);
        setLocalStream(stream);
        await callClient.createPeer(ice);
        const answer = await callClient.makeAnswer(sdp);
        socket.emit("call:answer", { callId, sdp: answer });
        dispatch(setStatus("active"));
      } catch (err) {
        addToast(err?.message || "Call failed", "error");
        callClient.close();
        dispatch(resetCall());
      }
    };

    const onAnswer = async ({ sdp }) => {
      await callClient.setRemoteAnswer(sdp);
      dispatch(setStatus("active"));
    };

    const onIce = ({ candidate }) => callClient.addIce(candidate);
    const onEnd = () => {
      callClient.close();
      setLocalStream(null);
      setRemoteStream(null);
      dispatch(resetCall());
    };
    const onDecline = () => {
      callClient.close();
      setLocalStream(null);
      setRemoteStream(null);
      dispatch(resetCall());
      addToast("Call declined", "info");
    };
    const onBusy = () => {
      callClient.close();
      setLocalStream(null);
      setRemoteStream(null);
      dispatch(resetCall());
      addToast("User is busy on another call", "error");
    };
    const onUnavailable = () => {
      callClient.close();
      setLocalStream(null);
      setRemoteStream(null);
      dispatch(resetCall());
      addToast("User is not reachable right now", "error");
    };
    const onError = (e) => {
      callClient.close();
      setLocalStream(null);
      setRemoteStream(null);
      dispatch(resetCall());
      addToast(e?.message || "Call error", "error");
    };
    const onMissed = () => addToast("You missed a call", "info");

    socket.on("call:created", onCreated);
    socket.on("call:invite", onInvite);
    socket.on("call:accept", onAccept);
    socket.on("call:offer", onOffer);
    socket.on("call:answer", onAnswer);
    socket.on("call:ice-candidate", onIce);
    socket.on("call:end", onEnd);
    socket.on("call:decline", onDecline);
    socket.on("call:busy", onBusy);
    socket.on("call:unavailable", onUnavailable);
    socket.on("call:error", onError);
    socket.on("call:missed", onMissed);

    return () => {
      socket.off("call:created", onCreated);
      socket.off("call:invite", onInvite);
      socket.off("call:accept", onAccept);
      socket.off("call:offer", onOffer);
      socket.off("call:answer", onAnswer);
      socket.off("call:ice-candidate", onIce);
      socket.off("call:end", onEnd);
      socket.off("call:decline", onDecline);
      socket.off("call:busy", onBusy);
      socket.off("call:unavailable", onUnavailable);
      socket.off("call:error", onError);
      socket.off("call:missed", onMissed);
    };
  }, [user?._id, dispatch, addToast, store]);

  const startCall = useCallback(
    async (calleeId, type, chatId, peer) => {
      dispatch(startOutgoing({ peer, type, chatId }));
      try {
        const ice = await callClient.fetchIceServers();
        const stream = await callClient.getMedia(type);
        setLocalStream(stream);
        await callClient.createPeer(ice);
      } catch (err) {
        callClient.close();
        setLocalStream(null);
        setRemoteStream(null);
        dispatch(resetCall());
        addToast(
          err?.name === "NotAllowedError"
            ? "Microphone/camera permission is required to start a call"
            : "Could not access microphone/camera",
          "error"
        );
        return;
      }
      socketRef.current?.emit("call:invite", { calleeId, type, chatId });
    },
    [dispatch, addToast]
  );

  const acceptCall = useCallback(async () => {
    const { callId, type } = store.getState().call;
    try {
      const ice = await callClient.fetchIceServers();
      const stream = await callClient.getMedia(type);
      setLocalStream(stream);
      await callClient.createPeer(ice);
      dispatch(setStatus("connecting"));
      socketRef.current?.emit("call:accept", { callId });
    } catch (err) {
      addToast(err?.message || "Could not answer", "error");
      callClient.close();
      dispatch(resetCall());
    }
  }, [dispatch, addToast, store]);

  const declineCall = useCallback(() => {
    const { callId } = store.getState().call;
    socketRef.current?.emit("call:decline", { callId });
    callClient.close();
    setLocalStream(null);
    setRemoteStream(null);
    dispatch(resetCall());
  }, [dispatch, store]);

  const endCall = useCallback(() => {
    const { callId } = store.getState().call;
    socketRef.current?.emit("call:end", { callId, reason: "hangup" });
    callClient.close();
    setLocalStream(null);
    setRemoteStream(null);
    dispatch(resetCall());
  }, [dispatch, store]);

  const toggleMute = useCallback(() => {
    callClient.toggleMute();
    dispatch(toggleMuteAction());
  }, [dispatch]);

  const toggleCamera = useCallback(() => {
    callClient.toggleCamera();
    dispatch(toggleCameraAction());
  }, [dispatch]);

  const switchCamera = useCallback(() => callClient.switchCamera(), []);

  // Auto-disconnect if the call never reaches an active (connected) state,
  // within 10s of being initiated (outgoing) or connecting.
  const endCallRef = useRef(endCall);
  const callDeadlineRef = useRef(null);
  useEffect(() => {
    endCallRef.current = endCall;
  }, [endCall]);

  useEffect(() => {
    if ((status === "outgoing" || status === "connecting") && !callDeadlineRef.current) {
      callDeadlineRef.current = setTimeout(() => {
        callDeadlineRef.current = null;
        if (store.getState().call.status !== "active") {
          addToast("Call could not connect. Please try again.", "error");
          endCallRef.current();
        }
      }, 10000);
    }
    if (status === "active" || !status) {
      if (callDeadlineRef.current) {
        clearTimeout(callDeadlineRef.current);
        callDeadlineRef.current = null;
      }
    }
  }, [status, store, addToast]);

  return {
    startCall,
    acceptCall,
    declineCall,
    endCall,
    toggleMute,
    toggleCamera,
    switchCamera,
    localStream,
    remoteStream,
  };
};
