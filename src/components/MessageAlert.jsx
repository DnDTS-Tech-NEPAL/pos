import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle, faExclamationCircle } from "@fortawesome/free-solid-svg-icons";

const MessageAlert = ({ message }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (message.text) {
      setShow(true);
      const timer = setTimeout(() => setShow(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  if (!message.text || !show) return null;

  return (
    <div
      className={`fixed top-10 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[999] p-4 rounded-lg shadow-lg flex items-center gap-3 transition-all duration-300 ${
        message.type === "error"
          ? "bg-red-100 border border-red-200 text-red-800"
          : "bg-blue-100 border border-blue-200 text-blue-800"
      }`}
    >
      <FontAwesomeIcon
        icon={message.type === "error" ? faExclamationCircle : faCheckCircle}
        className={`text-xl ${
          message.type === "error" ? "text-red-500" : "text-blue-500"
        }`}
      />
      {message.text}
    </div>
  );
};

export default MessageAlert;
