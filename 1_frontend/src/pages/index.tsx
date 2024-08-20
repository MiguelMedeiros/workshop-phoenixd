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
import { Circle, PersonStanding, Zap } from "lucide-react";

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
  const [balance, setBalance] = useState(null);
  const [nodeInfo, setNodeInfo] = useState<any>(null);
  const [usersConnected, setUsersConnected] = useState(0);

  const fetchNodeInfo = async () => {
    const response = await axios.get(`${NEXT_PUBLIC_BACKEND_URL}/node-info`);

    setNodeInfo(response.data.info);
  };

  const fetchBalance = async () => {
    const response = await axios.get(`${NEXT_PUBLIC_BACKEND_URL}/balance`);

    setBalance(response.data.balance);
  };

  useEffect(() => {
    fetchBalance();
    fetchNodeInfo();
  }, []);

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

    socket.on("users-connected", (message) => {
      setUsersConnected(message);
    });

    socket.on("new-message", (message) => {
      const messageParsed = JSON.parse(message);

      setListInvoices((prevInvoices) => [messageParsed, ...prevInvoices]);
      setRunConfetti(true);
      fetchBalance();

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
        {/* <UsersConnected usersConnected={usersConnected} /> */}
        <DashboardSection
          balance={balance}
          usersConnected={usersConnected}
          nodeInfo={nodeInfo}
        />
        {/* <NodeInfoSection nodeInfo={nodeInfo} /> */}
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

const DashboardSection = ({
  balance,
  usersConnected,
  nodeInfo,
}: {
  balance: {
    balanceSat: number;
    feeCreditSat: number;
  } | null;
  usersConnected: number;
  nodeInfo: any;
}) => {
  return (
    <div className="flex flex-col items-center justify-center bg-gray-800 text-white p-6 rounded-lg shadow-lg w-full max-w-[710px]">
      <div className="grid grid-cols-3 gap-12 p-4">
        <div className="flex flex-col">
          <div className="text-gray-400 text-[12px]">Online</div>
          <div className="text-[20px] font-semibold text-purple-400 flex flex-row items-center">
            <PersonStanding size={18} className="mr-1 text-purple-400" />
            {usersConnected.toLocaleString()}
          </div>
        </div>

        <div className="flex flex-col">
          <div className="text-gray-400 text-[12px]">Balance</div>
          <div className="text-[20px] font-semibold text-green-400 flex flex-row items-center">
            <Zap size={18} className="mr-1" />
            {balance?.balanceSat ? balance.balanceSat.toLocaleString() : 0}
          </div>
        </div>

        <div className="flex flex-col">
          <div className="text-gray-400 text-[12px]">Node ID</div>
          <div className="text-[20px] font-semibold text-gray-200 flex flex-row items-center">
            {nodeInfo?.nodeId.substring(0, 10)}...
          </div>
        </div>

        <div className="flex flex-col">
          <div className="text-gray-400 text-[12px]">Chain</div>
          <div className="text-[20px] font-semibold text-gray-200 flex flex-row items-center">
            {nodeInfo?.chain}
          </div>
        </div>

        <div className="flex flex-col">
          <div className="text-gray-400 text-[12px]">Block Height</div>
          <div className="text-[20px] font-semibold text-gray-200 flex flex-row items-center">
            {nodeInfo?.blockHeight}
          </div>
        </div>

        <div className="flex flex-col">
          <div className="text-gray-400 text-[12px]">Version</div>
          <div className="text-[20px] font-semibold text-green-400 flex flex-row items-center">
            {nodeInfo?.version}
          </div>
        </div>
      </div>
    </div>
  );
};
