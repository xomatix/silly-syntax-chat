import { useAutoAnimate } from "@formkit/auto-animate/react";
import ReactDOM from "react-dom";

interface PopupProps {
  children: React.ReactNode;
  onClose: () => void;
}

const PopupComponent: React.FC<PopupProps> = ({ children, onClose }) => {
  const [animationParent] = useAutoAnimate();

  return ReactDOM.createPortal(
    <div
      ref={animationParent}
      className="fixed flex flex-col justify-center space-y-2 inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center"
    >
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-4 relative">
        <button
          className="absolute transform translate-x-1/2 -translate-y-1/2 top-0 right-0 bg-slate-300 text-white rounded-full p-2 hover:bg-red-700"
          onClick={onClose}
        >
          ❌
        </button>
        <div>{children}</div>
      </div>
    </div>,
    document.body
  );
};

export default PopupComponent;
