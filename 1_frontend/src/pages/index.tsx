import { Inter } from "next/font/google";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { requestProvider } from "webln";
import axios from "axios";

import ConfettiExplosion from "@/components/Confetti";
import HeroSection from "@/components/HeroSection";
import MessagesSection from "@/components/MessageSection";
import PopUpModal from "@/components/PopupModal";
import FormMessage from "@/components/FormMessage";
import InvoiceQR from "@/components/InvoiceQr";

const inter = Inter({ subsets: ["latin"] });

const NEXT_PUBLIC_BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:9470";
const NEXT_PUBLIC_LIMIT_MESSAGES = process.env.NEXT_PUBLIC_LIMIT_MESSAGES || 5;

export default function Home() {
  const [socketId, setSocketId] = useState<string | null>(null);
  const [listInvoices, setListInvoices] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [page, setPage] = useState(1);
  const [stage, setStage] = useState(0);
  const [invoice, setInvoice] = useState<string | null>(null);
  const [disableLoadMore, setDisableLoadMore] = useState(true);
  const [runConfetti, setRunConfetti] = useState(false);
  const [author, setAuthor] = useState("");
  const [message, setMessage] = useState("");
  const [amount, setAmount] = useState(1000);

  const fetchInvoices = async (page: number) => {
    const response = await axios.get(`${NEXT_PUBLIC_BACKEND_URL}/invoices`, {
      params: {
        page: page,
        limit: NEXT_PUBLIC_LIMIT_MESSAGES,
      },
    });

    setDisableLoadMore(false);

    if (response.data.invoices.length < NEXT_PUBLIC_LIMIT_MESSAGES) {
      setDisableLoadMore(true);
    }

    setListInvoices((prevInvoices) => [
      ...prevInvoices,
      ...response.data.invoices,
    ]);
  };

  useEffect(() => {
    if (!socketId) return;
    fetchInvoices(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socketId, page]);

  useEffect(() => {
    const socket = io(`${NEXT_PUBLIC_BACKEND_URL}`);

    socket.on("connect", () => {
      if (socket.id) {
        setSocketId(socket.id);
      }
    });

    socket.on("paid", () => {
      setInvoice(null);
      setStage(0);
      setShowModal(false);
      cleanForm();
    });

    socket.on("new-message", (message) => {
      const messageParsed = JSON.parse(message);

      setListInvoices((prevInvoices) => [messageParsed, ...prevInvoices]);
      setRunConfetti(true);

      setTimeout(() => {
        setRunConfetti(false);
      }, 5000);
    });

    return () => {
      socket.off("connect");
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const nextPage = () => {
    setPage((prevPage) => prevPage + 1);
  };

  const cleanForm = () => {
    setAuthor("");
    setMessage("");
    setAmount(1000);
  };

  const initWebLN = async () => {
    try {
      if (!invoice) return;

      const webln = await requestProvider();

      webln.enable();
      webln.sendPayment(invoice);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (!invoice) return;

    initWebLN();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoice]);

  return (
    <>
      <main
        className={`flex flex-col min-h-screen ${
          listInvoices.length === 0 ? "justify-around" : ""
        } items-center p-24 bg-gray-900 text-white ${inter.className}`}
      >
        <HeroSection setShowModal={setShowModal} />
        <MessagesSection
          listInvoices={listInvoices}
          nextPage={nextPage}
          disableLoadMore={disableLoadMore}
        />
        {runConfetti && <ConfettiExplosion />}
      </main>
      <PopUpModal
        showModal={showModal}
        setShowModal={setShowModal}
        setInvoice={setInvoice}
        setStage={setStage}
      >
        {stage === 0 && (
          <FormMessage
            setShowModal={setShowModal}
            socketId={socketId}
            setInvoice={setInvoice}
            setStage={setStage}
            author={author}
            message={message}
            setAuthor={setAuthor}
            setMessage={setMessage}
            setAmount={setAmount}
            amount={amount}
          />
        )}
        {stage === 1 && (
          <div>
            <InvoiceQR invoice={invoice} />
            <div className="w-full flex justify-center mt-4">
              <button
                className="w-full text-gray-300 bg-gray-700 px-4 py-3 rounded-full hover:bg-gray-600 transition duration-200"
                onClick={() => {
                  setStage(0);
                  setInvoice(null);
                }}
              >
                Back
              </button>
            </div>
          </div>
        )}
      </PopUpModal>
    </>
  );
}
