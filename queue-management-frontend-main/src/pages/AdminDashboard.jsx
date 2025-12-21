function AdminDashboard({ counters, setCounters }) {
  // Call next token
  const callNext = (id) => {
    setCounters((prev) =>
      prev.map((counter) => {
        if (counter.counterId !== id) return counter;
        if (counter.current || counter.queue.length === 0) return counter;

        return {
          ...counter,
          current: counter.queue[0],
          queue: counter.queue.slice(1),
        };
      })
    );
  };

  // Serve current token
  const serveToken = (id) => {
    setCounters((prev) =>
      prev.map((counter) => {
        if (counter.counterId !== id) return counter;
        if (!counter.current) return counter;

        return {
          ...counter,
          current: null,
        };
      })
    );
  };

  // Skip current token (handles last token correctly)
  const skipToken = (id) => {
    setCounters((prev) =>
      prev.map((counter) => {
        if (counter.counterId !== id) return counter;
        if (!counter.current) return counter;

        // If queue has next token
        if (counter.queue.length > 0) {
          return {
            ...counter,
            current: counter.queue[0],
            queue: counter.queue.slice(1),
          };
        }

        // Last token skipped
        return {
          ...counter,
          current: null,
        };
      })
    );
  };

  return (
    <div className="admin-wrapper">
      <h1 className="admin-title">Admin Dashboard</h1>

      <div className="counter-grid">
        {counters.map((counter) => {
          const hasCurrent = counter.current !== null;
          const hasQueue = counter.queue.length > 0;

          return (
            <div className="counter-panel" key={counter.counterId}>
              <h2>{counter.name}</h2>

              <p className="current-token">
                Now Serving:{" "}
                <strong>{counter.current ?? "—"}</strong>
              </p>

              <div className="queue-list">
                {counter.queue.length === 0 ? (
                  <p className="empty">No tokens in queue</p>
                ) : (
                  counter.queue.map((token) => (
                    <div className="queue-token" key={token}>
                      Token {token}
                    </div>
                  ))
                )}
              </div>

              <div className="action-buttons">
                <button
                  className="call-btn"
                  onClick={() => callNext(counter.counterId)}
                  disabled={hasCurrent || !hasQueue}
                >
                  Call Next
                </button>

                <button
                  className="serve-btn"
                  onClick={() => serveToken(counter.counterId)}
                  disabled={!hasCurrent}
                >
                  Serve
                </button>

                <button
                  className="skip-btn"
                  onClick={() => skipToken(counter.counterId)}
                  disabled={!hasCurrent}
                >
                  Skip
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default AdminDashboard;
