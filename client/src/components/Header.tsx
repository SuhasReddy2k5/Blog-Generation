import { ThumbsUp } from "lucide-react";

export default function Header() {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <ThumbsUp className="h-8 w-8 text-primary" />
            <h1 className="ml-2 text-xl font-semibold text-gray-800">VideoToBlog</h1>
          </div>
          <nav>
            <a href="#how-it-works" className="text-gray-600 hover:text-primary transition-colors">
              How it works
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}
