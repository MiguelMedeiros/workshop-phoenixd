import axios from "axios";
import { Eraser, Send } from "lucide-react";
import { useState } from "react";
import { z } from "zod";

const NEXT_PUBLIC_BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const formSchema = z.object({
  author: z.string().min(1, "Author is required").max(50, "Author too long"),
  message: z
    .string()
    .min(1, "Message is required")
    .max(500, "Message too long"),
  amount: z
    .number()
    .min(1, "Amount must be at least 1")
    .max(500000, "Amount too high!"),
});

const FormMessage = ({
  setShowModal,
  socketId,
  setStage,
  setInvoice,
  author,
  message,
  setAuthor,
  setMessage,
  amount,
  setAmount,
}: {
  setShowModal: any;
  setStage: any;
  socketId: string | null;
  setInvoice: any;
  author: string;
  message: string;
  setAuthor: any;
  setMessage: any;
  amount: number;
  setAmount: any;
}) => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fetchInvoice = async () => {
    const response = await axios.post(
      `${NEXT_PUBLIC_BACKEND_URL}/new-invoice`,
      {
        author,
        message,
        amount,
        websocket_id: socketId,
      }
    );
    setInvoice(response.data.invoiceData.serialized);
    setStage(1);
  };

  const handleSubmit = async () => {
    try {
      formSchema.parse({ author, message, amount });
      setErrors({});
      fetchInvoice();
    } catch (e: any) {
      const formattedErrors: Record<string, string> = {};
      e.errors.forEach((err: any) => {
        formattedErrors[err.path[0]] = err.message;
      });
      setErrors(formattedErrors);
    }
  };

  return (
    <div className="flex flex-col space-y-6 w-full min-w-[300px] p-2 bg-gray-800 rounded-lg">
      <h2 className="text-2xl font-bold text-white mb-0">
        Fire away, I&lsquo;m bulletproof!
      </h2>

      <div className="space-y-2">
        <input
          type="text"
          placeholder="Your name or nickname"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          className="w-full text-gray-900 px-4 py-3 rounded-md bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-200"
        />
        {errors.author && (
          <p className="text-red-400 text-sm">{errors.author}</p>
        )}
      </div>

      <div className="space-y-2">
        <textarea
          placeholder="What would you like to ask?"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full text-gray-900 px-4 py-3 rounded-md bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-200 h-32 resize-none"
        />
        {errors.message && (
          <p className="text-red-400 text-sm">{errors.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center">
          <input
            type="number"
            placeholder="Sats"
            value={amount}
            onChange={(e) => setAmount(parseInt(e.target.value))}
            className="w-full text-gray-900 px-4 py-3 rounded-l-md bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-200"
          />
          <span className="bg-gray-700 text-white px-4 py-3 rounded-r-md">
            sats
          </span>
        </div>
        {errors.amount && (
          <p className="text-red-400 text-sm">{errors.amount}</p>
        )}
      </div>

      <button
        className="w-full text-white bg-purple-600 px-4 py-3 rounded-full hover:bg-purple-700 transition duration-200 font-semibold flex items-center justify-center space-x-2"
        onClick={() => handleSubmit()}
      >
        <Send className="w-5 h-5" />
        <span>Send Question & Pay</span>
      </button>

      <button
        className="w-full text-gray-300 px-4 py-0 rounded-full hover:underline transition duration-200 flex items-center justify-center space-x-2"
        onClick={() => setShowModal(false)}
      >
        <Eraser className="w-5 h-5" />
        <span>Cancel</span>
      </button>
    </div>
  );
};

export default FormMessage;
