export default function Footer() {
  return (
    <footer className="bg-gray-50 mt-12 border-t border-gray-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-500">© {new Date().getFullYear()} VideoToBlog. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-gray-500 hover:text-gray-700">
              Terms of Service
            </a>
            <a href="#" className="text-gray-500 hover:text-gray-700">
              Privacy Policy
            </a>
            <a href="#" className="text-gray-500 hover:text-gray-700">
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
