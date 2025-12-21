import { useState } from "react";
import bankLogo from "../assets/logo.png";

function TokenGenerate({ onNext }) {
  const [service, setService] = useState("");

  return (
    <div className="page-wrapper">
      <div className="card">

        {/* Header */}
        <div className="header">
          <button className="back-btn" disabled>
            ← Back
          </button>
        </div>

        {/* Bank Logo */}
        <div className="logo-container">
          <img src={bankLogo} alt="Bank Logo" />
          <h3 className="bank-name">OUTFYLD Bank</h3>
        </div>

        <h1 className="title">Generate Token</h1>
        <p className="subtitle">
          Select your service to get a same-day token
        </p>

        <label className="label">Service Type</label>
        <select
          className="select"
          value={service}
          onChange={(e) => setService(e.target.value)}
        >
          <option value="">-- Choose Service --</option>
          <option>Deposit</option>
          <option>Withdrawal</option>
          <option>Passbook Update</option>
          <option>Account Opening</option>
        </select>

        <button
          className="btn"
          disabled={!service}
          onClick={() => onNext(service)}
        >
          Generate Token
        </button>

        <p className="info">ℹ Tokens are valid only for today</p>
      </div>
    </div>
  );
}

export default TokenGenerate;
