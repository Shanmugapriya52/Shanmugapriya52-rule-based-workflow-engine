export default function Card({ title, children, className = "", hover = false }) {
  return (
    <div className={`bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-300 shadow-lg p-6 transition-all duration-300 ${
      hover ? "hover:shadow-xl hover:border-gray-400 transform hover:-translate-y-1" : ""
    } ${className}`}>
      {title && (
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-lg text-gray-900 tracking-tight">{title}</h3>
        </div>
      )}
      {children}
    </div>
  );
}