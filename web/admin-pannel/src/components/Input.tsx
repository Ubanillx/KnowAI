interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Input = ({ label, ...props }: InputProps) => (
  <div className="space-y-1">
    <label className="block text-sm font-semibold text-gray-600">{label}</label>
    <input 
      {...props}
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-200" 
    />
  </div>
);