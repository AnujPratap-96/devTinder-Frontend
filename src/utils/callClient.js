import { BASE_URL } from "../config/constants";

let pc = null;
let localStream = null;
let remoteStream = null;
let handlers = {};
// ICE candidates that arrived before the remote description was set.
// addIceCandidate() throws until setRemoteDescription() has run, and a throw
// means the candidate is lost forever — which is exactly why calls fail to
// connect across networks: both sides create their peer early and their
// candidates arrive too soon. We buffer here and replay them once the remote
// offer/answer is installed.
let pendingIce = [];

// Free public TURN fallback (Open Relay Project) — used when the backend
// returns no TURN servers (e.g. local dev). Mirrors the backend default.
const FALLBACK_TURN_SERVERS = [
  { urls: "turn:openrelay.metered.ca:80", username: "openrelayproject", credential: "openrelayproject" },
  { urls: "turn:openrelay.metered.ca:443", username: "openrelayproject", credential: "openrelayproject" },
  { urls: "turn:openrelay.metered.ca:443?transport=tcp", username: "openrelayproject", credential: "openrelayproject" },
];

const callClient = {
  setHandlers(h) {
    handlers = h;
  },
  getLocalStream: () => localStream,
  getRemoteStream: () => remoteStream,
  // [PHASE-1] additive getter for call-quality stats polling
  getPeer: () => pc,

  async getMedia(type) {
    if (localStream) return localStream;
    localStream = await navigator.mediaDevices.getUserMedia({
      // Explicit AEC/NS/AGC — some browsers (Windows/Chrome with speaker
      // mics) ship these OFF for `audio: true`, which is what causes the
      // "my echo in their ears" feedback loop during voice calls.
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
      video: type === "video"
        ? { width: { ideal: 640 }, height: { ideal: 480 }, frameRate: { ideal: 24, max: 30 } }
        : false,
    });
    return localStream;
  },

  stopMedia() {
    if (localStream) {
      localStream.getTracks().forEach((t) => t.stop());
    }
    localStream = null;
    remoteStream = null;
  },

  async createPeer(iceServers) {
    if (pc) return pc;
    pc = new RTCPeerConnection({ iceServers });
    remoteStream = new MediaStream();
    if (localStream) {
      localStream.getTracks().forEach((t) => pc.addTrack(t, localStream));
    }
    pc.ontrack = (e) => {
      if (e.streams[0]) {
        e.streams[0].getTracks().forEach((t) => remoteStream.addTrack(t));
      } else if (e.track) {
        remoteStream.addTrack(e.track);
      }
      handlers.onRemote?.(remoteStream);
    };
    pc.onicecandidate = (e) => {
      if (e.candidate) handlers.onIce?.(e.candidate);
    };
    pc.oniceconnectionstatechange = () => handlers.onIceState?.(pc.iceConnectionState);
    pc.onconnectionstatechange = () => handlers.onState?.(pc.connectionState);
    pendingIce = [];
    return pc;
  },

  flushPendingIce() {
    if (!pc?.remoteDescription) return;
    const buffered = pendingIce.splice(0);
    for (const candidate of buffered) {
      if (!candidate) continue;
      try {
        pc.addIceCandidate(candidate);
      } catch {
        // late/duplicate candidates are non-fatal
      }
    }
  },

  async makeOffer() {
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    return pc.localDescription;
  },

  async makeAnswer(offerSdp) {
    await pc.setRemoteDescription(offerSdp);
    this.flushPendingIce();
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    return pc.localDescription;
  },

  async setRemoteAnswer(answerSdp) {
    await pc.setRemoteDescription(answerSdp);
    this.flushPendingIce();
  },

  async addIce(candidate) {
    try {
      if (pc && candidate) {
        if (pc.remoteDescription) await pc.addIceCandidate(candidate);
        else pendingIce.push(candidate);
      }
    } catch {
      // late/duplicate candidates are non-fatal
    }
  },

  async restartIce() {
    if (!pc) return null;
    try {
      const offer = await pc.createOffer({ iceRestart: true });
      await pc.setLocalDescription(offer);
      return pc.localDescription;
    } catch {
      return null;
    }
  },

  toggleMute() {
    if (!localStream) return false;
    const tracks = localStream.getAudioTracks();
    tracks.forEach((t) => (t.enabled = !t.enabled));
    return tracks[0] ? !tracks[0].enabled : false;
  },

  toggleCamera() {
    if (!localStream) return false;
    const tracks = localStream.getVideoTracks();
    tracks.forEach((t) => (t.enabled = !t.enabled));
    return tracks[0] ? !tracks[0].enabled : false;
  },

  async switchCamera() {
    if (!pc || !localStream) return;
    const videoTrack = localStream.getVideoTracks()[0];
    if (!videoTrack) return;
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cams = devices.filter((d) => d.kind === "videoinput");
    if (cams.length < 2) return;
    const current = videoTrack.getSettings?.().deviceId;
    const next = cams.find((d) => d.deviceId !== current) || cams[0];
    const newStream = await navigator.mediaDevices.getUserMedia({
      video: { deviceId: { exact: next.deviceId } },
      audio: false,
    });
    const newTrack = newStream.getVideoTracks()[0];
    const sender = pc.getSenders().find((s) => s.track && s.track.kind === "video");
    if (sender) await sender.replaceTrack(newTrack);
    videoTrack.stop();
    localStream.removeTrack(videoTrack);
    localStream.addTrack(newTrack);
  },

  async fetchIceServers() {
    try {
      const { data } = await (await import("axios")).default.get(
        `${BASE_URL}/calls/turn-credentials`,
        { withCredentials: true }
      );
      const servers = data?.data?.iceServers || [];
      const hasTurn = servers.some((s) => String(s.urls || "").includes("turn:"));
      if (!hasTurn) return [...servers, ...FALLBACK_TURN_SERVERS];
      return servers;
    } catch {
      return [
        { urls: "stun:stun.l.google.com:19302" },
        ...FALLBACK_TURN_SERVERS,
      ];
    }
  },

  close() {
    if (pc) {
      try {
        pc.close();
      } catch {
        // peer already closed
      }
      pc = null;
    }
    pendingIce = [];
    this.stopMedia();
  },
};

export default callClient;
