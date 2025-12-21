import { useState, useEffect } from "react";
import socket from "../services/socketService.js";

function KioskDisplay() {
  const [counters, setCounters] = useState([
    { counterId: 1, name: "Counter 1", current: null },
    { counterId: 2, name: "Counter 2", current: null },
    { counterId: 3, name: "Counter 3", current: null },
  ]);

  useEffect(() => {
    // Connect to WebSocket
    socket.connect();

    // Join kiosk room
    socket.emit("join:kiosk");

    // Listen for token called events
    socket.on("token:called", (data) => {
      console.log("Token called:", data);
      setCounters((prev) =>
        prev.map((counter) =>
          counter.counterId === data.counterId
            ? { ...counter, current: data.token.tokenNumber }
            : counter
        )
      );
    });

    // Cleanup on unmount
    return () => {
      socket.off("token:called");
      socket.disconnect();
    };
  }, []);

  return (
    <div className="kiosk-wrapper">
      <div className="kiosk-header">
        <h1>OUTFYLD BANK</h1>
        <p>Intelligent Queue Management System</p>
      </div>

      <div className="kiosk-body">
        <h2 className="now-serving">Now Serving</h2>

        <div className="counter-list">
          {counters.map((counter) => (
            <div className="counter-card" key={counter.counterId}>
              <p className="counter-name">{counter.name}</p>
              <p className="token-big">
                {counter.current ?? "—"}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="kiosk-footer">
        <p>Please wait until your token is called</p>
      </div>
    </div>
  );
}

export default KioskDisplay;
