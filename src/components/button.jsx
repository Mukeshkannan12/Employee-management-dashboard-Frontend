
const Button = ({ type = 'submit', onClick, children, className = '' }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`w-full bg-sky-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-opacity-50 transition duration-200 ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;

