import { BASE_URL, createSocketConnection } from "../utils/constant";

let pc = null;
let localStream = null;
let remoteStream = null;
let handlers = {};

const callClient = {
  setHandlers(h) {
    handlers = h;
  },
  getLocalStream: () => localStream,
  getRemoteStream: () => remoteStream,

  async getMedia(type) {
    if (localStream) return localStream;
    localStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: type === "video",
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
      e.streams[0].getTracks().forEach((t) => remoteStream.addTrack(t));
      handlers.onRemote?.(remoteStream);
    };
    pc.onicecandidate = (e) => {
      if (e.candidate) handlers.onIce?.(e.candidate);
    };
    pc.onconnectionstatechange = () => handlers.onState?.(pc.connectionState);
    return pc;
  },

  async makeOffer() {
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    return pc.localDescription;
  },

  async makeAnswer(offerSdp) {
    await pc.setRemoteDescription(offerSdp);
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    return pc.localDescription;
  },

  async setRemoteAnswer(answerSdp) {
    await pc.setRemoteDescription(answerSdp);
  },

  async addIce(candidate) {
    try {
      if (pc && candidate) await pc.addIceCandidate(candidate);
    } catch (err) {
      // late/duplicate candidates are non-fatal
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
      return data.data.iceServers;
    } catch {
      return [{ urls: "stun:stun.l.google.com:19302" }];
    }
  },

  close() {
    if (pc) {
      try {
        pc.close();
      } catch {}
      pc = null;
    }
    this.stopMedia();
  },
};

export default callClient;
