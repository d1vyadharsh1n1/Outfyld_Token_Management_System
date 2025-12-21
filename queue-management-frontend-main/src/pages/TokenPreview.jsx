import { useState, useEffect } from "react";
import { generateToken } from "../services/tokenService";

function TokenPreview({ service, onBack }) {
  const [loading, setLoading] = useState(true);
  const [tokenData, setTokenData] = useState(null);

  useEffect(() => {
    generateToken(service).then((data) => {
      setTokenData(data);
      setLoading(false);
    });
  }, [service]);

  return (
    <div className="page-wrapper">
      <div className="card">

        {/* Header */}
        <div className="header">
          <button
            className="back-btn"
            onClick={onBack}
            disabled={loading}
          >
            ← Back
          </button>
        </div>

        <h1 className="title">Token Generated 🎉</h1>

        {/* Token Box */}
        <div className="token-box">
          {loading ? (
            <p className="token-label">Generating your token...</p>
          ) : (
            <>
              <p className="token-label">Your Token Number</p>
              <h2 className="token-number">
                {tokenData.tokenNumber}
              </h2>
            </>
          )}
        </div>

        {/* Details */}
        {!loading && (
          <div className="details">
            <p>
              <strong>Service:</strong> {tokenData.service}
            </p>
            <p>
              <strong>Assigned Counter:</strong>{" "}
              {tokenData.counter}
            </p>
            <p>
              <strong>Estimated Wait:</strong>{" "}
              {tokenData.waitTime}
            </p>
          </div>
        )}

        <p className="info">
          Please wait until your token is called on the display.
        </p>
      </div>
    </div>
  );
}

export default TokenPreview;
