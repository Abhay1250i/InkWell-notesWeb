/**
 * components/LoadingScreen.jsx — Full-screen spinner for auth check
 */

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-stone-50 dark:bg-stone-950">
      <div className="flex flex-col items-center gap-4">
        {/* Animated logo mark */}
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 rounded-full border-2 border-accent-200 dark:border-accent-900" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-accent-600 animate-spin" />
        </div>
        <span className="font-serif text-lg text-stone-400 dark:text-stone-600 tracking-wide">
          Inkwell
        </span>
      </div>
    </div>
  )
}
