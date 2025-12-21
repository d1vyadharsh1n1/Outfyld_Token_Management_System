// only token generator page 


// import { useState } from "react";
// import TokenGenerate from "./pages/TokenGenerate";
// import TokenPreview from "./pages/TokenPreview";

// function App() {
//   const [step, setStep] = useState(1);
//   const [service, setService] = useState("");

//   return (
//     <>
//       {step === 1 && (
//         <TokenGenerate
//           onNext={(selectedService) => {
//             setService(selectedService);
//             setStep(2);
//           }}
//         />
//       )}

//       {step === 2 && (
//         <TokenPreview
//           service={service}
//           onBack={() => setStep(1)}
//         />
//       )}
//     </>
//   );
// }

// export default App;





// only display code 


// import KioskDisplay from "./pages/KioskDisplay";

// function App() {
//   return <KioskDisplay />;
// }

// export default App;






// both code 

// import { useState } from "react";
// import TokenGenerate from "./pages/TokenGenerate";
// import TokenPreview from "./pages/TokenPreview";
// import KioskDisplay from "./pages/KioskDisplay";

// function App() {
//   const [step, setStep] = useState(1);
//   const [service, setService] = useState("");

//   // Change this flag to true to show kiosk
//   const isKioskMode = false;

//   if (isKioskMode) {
//     return <KioskDisplay />;
//   }

//   return (
//     <>
//       {step === 1 && (
//         <TokenGenerate
//           onNext={(selectedService) => {
//             setService(selectedService);
//             setStep(2);
//           }}
//         />
//       )}

//       {step === 2 && (
//         <TokenPreview
//           service={service}
//           onBack={() => setStep(1)}
//         />
//       )}
//     </>
//   );
// }

// export default App;





// Admin Dashboard
// import AdminDashboard from "./pages/AdminDashboard";

// function App() {
//   return <AdminDashboard />;
// }

// export default App;




// All Integrated
import { useState } from "react";
import TokenGenerate from "./pages/TokenGenerate";
import TokenPreview from "./pages/TokenPreview";
import AdminDashboard from "./pages/AdminDashboard";
import KioskDisplay from "./pages/KioskDisplay";

function App() {
  const [mode, setMode] = useState("admin"); // customer | admin | kiosk

  // Customer flow state
  const [step, setStep] = useState(1);
  const [service, setService] = useState("");

  // Shared counter state
  const [counters, setCounters] = useState([
    { counterId: 1, name: "Counter 1", queue: [101, 102, 103], current: null },
    { counterId: 2, name: "Counter 2", queue: [205, 206], current: null },
    { counterId: 3, name: "Counter 3", queue: [118, 119, 120], current: null },
  ]);

  return (
    <>
      {/* Demo mode switcher */}
      <div style={{ padding: "10px" }}>
        <button onClick={() => setMode("customer")}>Customer</button>
        <button onClick={() => setMode("admin")}>Admin</button>
        <button onClick={() => setMode("kiosk")}>Kiosk</button>
      </div>

      {/* CUSTOMER FLOW */}
      {mode === "customer" && (
        <>
          {step === 1 && (
            <TokenGenerate
              onNext={(selectedService) => {
                setService(selectedService);
                setStep(2);
              }}
            />
          )}

          {step === 2 && (
            <TokenPreview
              service={service}
              onBack={() => setStep(1)}
            />
          )}
        </>
      )}

      {/* ADMIN */}
      {mode === "admin" && (
        <AdminDashboard
          counters={counters}
          setCounters={setCounters}
        />
      )}

      {/* KIOSK */}
      {mode === "kiosk" && (
        <KioskDisplay />
      )}
    </>
  );
}

export default App;
