const PaymentMethod = ({ name, logo, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-1 h-32 w-full px-3 py-2 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:scale-105 transition-transform duration-200 hover:border-pink-300"
    >
      <div className="flex items-center justify-center h-16 w-16 rounded-full bg-gray-50 p-1.5">
        <img
          src={logo}
          alt={`${name} logo`}
          className="h-full w-full object-contain"
        />
      </div>
      <span className="text-base font-medium text-gray-700 mt-1">{name}</span>
    </button>
  );
};

export default PaymentMethod;
