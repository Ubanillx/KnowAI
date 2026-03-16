interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export const Input = ({ label, error, leftElement, rightElement, ...props }: InputProps) => (
  <div className="space-y-1 w-full text-left">
    <label className="block text-[11px] sm:text-sm font-bold text-gray-700 ml-1 uppercase tracking-wider">{label}</label>
    <div className="relative flex items-center group">
      {leftElement && (
        <div className="absolute left-3 z-10 border-r border-gray-200 pr-2 h-4 sm:h-5 flex items-center">
          {leftElement}
        </div>
      )}
      <input
        {...props}
        className={`
          w-full text-sm sm:text-base transition-all duration-300 outline-none rounded-xl border
          ${leftElement ? 'pl-16 sm:pl-20' : 'pl-4'} 
          ${rightElement ? 'pr-24 sm:pr-28' : 'pr-4'}
          py-2 sm:py-2.5 bg-gray-50/50 hover:bg-white focus:bg-white
          ${error ? 'border-red-400 ring-4 ring-red-50' : 'border-gray-200 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500'}
        `}
      />
      {rightElement && (
        <div className="absolute right-1.5 sm:right-2">
          {rightElement}
        </div>
      )}
    </div>
    {error && <p className="text-[10px] text-red-500 ml-1 mt-0.5 font-medium animate-in fade-in zoom-in-95">{error}</p>}
  </div>
);

