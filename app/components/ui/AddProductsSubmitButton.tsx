import { useFormStatus } from "react-dom";

interface SubmitButtonProps {
  isDarkMode?: boolean;
  children: React.ReactNode;
}

export default function AddProductsSubmitButton({
  isDarkMode = false,
  children,
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={`px-6 py-3 rounded-lg font-medium hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${
        isDarkMode
          ? "bg-slate-600 hover:bg-slate-700 text-slate-100"
          : "bg-blue-600 hover:bg-blue-700 text-white"
      }`}
    >
      {pending && (
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
      )}
      {pending ? "Adding Product..." : children}
    </button>
  );
}
