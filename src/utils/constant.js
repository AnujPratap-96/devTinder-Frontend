export const BASE_URL = location.hostname === "localhost" ? "http://localhost:3000" : "/api";

import io from "socket.io-client";

export const createSocketConnection = () => {
    if(location.hostname === "localhost"){

        return io(BASE_URL);
    }
    else{
        return io("/" , {path : "/api/socket.io"})
    }
};