import { useState } from "react";
import QRCode from "react-qr-code";

const InvoiceQR = ({ invoice }: { invoice: string | null }) => {
  const [hoverText, setHoverText] = useState(
    "Scan the QR code or click to copy"
  );
  const [isCopied, setIsCopied] = useState(false);

  const handleMouseEnter = () => {
    setHoverText("Click to copy");
  };

  const handleMouseLeave = () => {
    if (!isCopied) {
      setHoverText("Scan the QR code or click to copy");
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(invoice || "");
    setIsCopied(true);
    setHoverText("Copied to clipboard");

    setTimeout(() => {
      setIsCopied(false);
      setHoverText("Scan the QR code or click to copy");
    }, 4000);
  };

  return (
    <>
      {invoice ? (
        <div className="flex flex-col items-center bg-gray-800 rounded-lg p-2 max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-white mb-6">
            Ready to Zap Some Sats?
          </h2>

          <div
            className="bg-gray-700 p-4 rounded-lg shadow-lg mb-6 cursor-pointer"
            onClick={handleCopy}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <QRCode
              value={invoice}
              size={256}
              fgColor="#ffffff"
              bgColor="#374151"
            />
          </div>

          <p className="text-lg text-gray-300 mb-0 text-center">{hoverText}</p>
        </div>
      ) : (
        <div className="flex justify-center items-center h-64">
          <p className="text-lg text-gray-400">Generating invoice...</p>
        </div>
      )}
    </>
  );
};

export default InvoiceQR;
