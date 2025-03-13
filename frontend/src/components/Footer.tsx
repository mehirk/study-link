const Footer = () => {
  return (
    <footer className="py-4 px-6 border-t">
      <div className="text-center text-sm text-gray-500 dark:text-gray-400">
        &copy; {new Date().getFullYear()} Study Link. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer; 