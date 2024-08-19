import { User, Zap } from "lucide-react";
import { useEffect, useState } from "react";

const MessagesSection = ({
  listInvoices,
  nextPage,
  disableLoadMore,
}: {
  listInvoices: any[];
  nextPage: any;
  disableLoadMore?: boolean;
}) => {
  const [counter, setCounter] = useState(0);

  useEffect(() => {
    if (listInvoices.length > 0) {
      setCounter(listInvoices[0].total_questions);
    }
  }, [listInvoices]);

  return (
    <>
      {listInvoices.length > 0 && (
        <>
          <div className="w-full max-w-3xl mt-6">
            <div className="flex items-center justify-between mb-6 pl-6 pr-6">
              <h2 className="text-1xl font-bold text-gray-300">
                Here we go! Let&apos;s answer all these questions!
              </h2>
              <span className="text-sm text-gray-400">{counter} questions</span>
            </div>
          </div>
          <div className="w-full max-w-3xl bg-gray-900 pl-6 pr-6 rounded-lg mb-12 overflow-y-auto">
            <ListMessages messages={listInvoices} />
          </div>
        </>
      )}
      {!disableLoadMore && (
        <div className="w-full max-w-4xl flex justify-center">
          <button
            onClick={nextPage}
            className="text-gray-300 border border-gray-400 px-6 py-2 m-auto rounded-full"
          >
            Load More
          </button>
        </div>
      )}
    </>
  );
};

const ListMessages = ({ messages }: { messages: any[] }) => {
  return (
    <div className="flex flex-col space-y-4 bg-gray-900">
      {messages.map((message, index) => (
        <div key={index} className="flex justify-start">
          <div className="w-full p-3 rounded-lg bg-gray-800 text-gray-200 shadow-lg">
            <div className="flex items-center space-x-2 text-gray-500">
              <User className="w-4 h-4" />
              <p className="font-medium text-[14px]">{message.author}</p>
              <div className="grow" />
              <div className="flex items-center space-x-1 text-[11px] text-gray-500">
                <span>{new Date(message.updated_at).toLocaleString()}</span>
              </div>
            </div>
            <p className="text-[16px] p-4">{message.message}</p>
            <div className="mt-2 flex justify-between items-center text-xs">
              <div className="grow" />
              <div className="flex items-center space-x-1 text-yellow-400">
                <Zap className="w-4 h-4" />
                <span>{message.amount}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MessagesSection;
