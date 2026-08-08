/**
 * VoiceNoteRecorder.jsx — record a voice note and send it as an "audio"
 * chat message. Uses an optimistic pending message (clientMessageId is
 * echoed by the server) so the existing socket upsert replaces it cleanly.
 */
import { useEffect, useRef, useState } from "react";
import { HiMicrophone, HiStop, HiX } from "react-icons/hi";
import { uploadVoiceNote } from "./enhancementApi";

const MAX_DURATION_SEC = 60;

const VoiceNoteRecorder = ({ matchId, targetUserId, userId, onOptimistic, onRemove, onSent }) => {
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [readyBlob, setReadyBlob] = useState(null);
  const [sending, setSending] = useState(false);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  };

  useEffect(() => stopTimer, []);

  const startRecording = async () => {
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : undefined,
      });
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        setReadyBlob(blob);
        setElapsed(0);
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setRecording(true);
      setElapsed(0);
      timerRef.current = setInterval(() => {
        setElapsed((e) => {
          if (e + 1 >= MAX_DURATION_SEC) {
            stopRecording();
            return e;
          }
          return e + 1;
        });
      }, 1000);
    } catch {
      /* mic permission denied — silently ignore */
    }
  };

  const stopRecording = () => {
    stopTimer();
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    setRecording(false);
  };

  const cancel = () => {
    stopTimer();
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    setReadyBlob(null);
    setSending(false);
  };

  const send = async () => {
    if (!readyBlob || !userId || !targetUserId) return;
    const clientMessageId = `voice-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const blobUrl = URL.createObjectURL(readyBlob);
    const durationSec = Math.max(1, Math.round(elapsed || 1));

    onOptimistic({
      matchId,
      userId,
      targetUserId,
      clientMessageId,
      message: blobUrl,
      messageType: "audio",
      delivered: false,
      seen: false,
      status: "pending",
      createdAt: new Date().toISOString(),
      receiverId: targetUserId,
      senderId: userId,
      isOptimistic: true,
      metadata: { durationSec },
    });

    setSending(true);
    try {
      const formData = new FormData();
      formData.append("audio", readyBlob, "voice-note.webm");
      formData.append("matchId", matchId || "");
      formData.append("targetUserId", targetUserId);
      formData.append("clientMessageId", clientMessageId);
      formData.append("durationSec", String(durationSec));
      await uploadVoiceNote(formData);
      onSent?.();
    } catch {
      onRemove?.(clientMessageId);
    } finally {
      setSending(false);
      setReadyBlob(null);
      setElapsed(0);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
    }
  };

  if (recording) {
    return (
      <div className="flex h-11 items-center gap-2 rounded-xl bg-error-500/10 px-3">
        <span className="block h-2 w-2 animate-pulse rounded-full bg-error-500" />
        <span className="text-xs tabular-nums text-error-400">0:{String(elapsed).padStart(2, "0")}</span>
        <button
          type="button"
          onClick={stopRecording}
          className="ml-1 flex h-7 w-7 items-center justify-center rounded-full bg-error-500 text-white transition hover:bg-error-600"
          title="Stop recording"
        >
          <HiStop className="text-sm" />
        </button>
        <button
          type="button"
          onClick={cancel}
          className="flex h-7 w-7 items-center justify-center rounded-full text-neutral-400 transition hover:bg-tint-strong"
          title="Cancel"
        >
          <HiX className="text-sm" />
        </button>
      </div>
    );
  }

  if (readyBlob) {
    return (
      <div className="flex h-11 items-center gap-2 rounded-xl bg-tint-strong px-3">
        <span className="text-[10px] uppercase tracking-wider text-neutral-400">
          Voice note ready
        </span>
        <button
          type="button"
          onClick={send}
          disabled={sending}
          className="rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-brand-400 disabled:opacity-50"
        >
          {sending ? "Sending…" : "Send"}
        </button>
        <button
          type="button"
          onClick={cancel}
          className="flex h-7 w-7 items-center justify-center rounded-full text-neutral-400 transition hover:bg-tint"
          title="Discard"
        >
          <HiX className="text-sm" />
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={startRecording}
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-tint-strong text-neutral-400 transition hover:text-brand-400"
      title="Send voice note"
    >
      <HiMicrophone className="text-lg" />
    </button>
  );
};

export default VoiceNoteRecorder;
