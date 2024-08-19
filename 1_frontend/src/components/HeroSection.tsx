import { MessageCircle } from "lucide-react";

const HeroSection = ({ setShowModal }: { setShowModal: any }) => {
  return (
    <div className="mb-12 flex justify-center flex-col">
      <div className="flex justify-center text-5xl font-extrabold text-gray-200 mb-6">
        Welcome to
      </div>
      <h1 className="text-[40px] font-extrabold text-center text-purple-300 mb-2">
        PhoenixD Server Workshop
      </h1>
      <h2 className="text-1xl font-semibold text-center text-gray-200 mb-10">
        Got questions? Let’s light up the server and get answers!
      </h2>
      <button
        onClick={() => {
          setShowModal(true);
        }}
        className="text-white bg-purple-500 px-8 py-4 w-[250px] m-auto rounded-full flex items-center justify-center space-x-2"
      >
        <MessageCircle className="w-5 h-5" />
        <span>Ask me anything!</span>
      </button>
    </div>
  );
};

export default HeroSection;
