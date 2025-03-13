import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <div className="py-20 px-4 flex flex-col items-center justify-center text-center">
      <h1 className="text-4xl md:text-6xl font-bold mb-6">
        Welcome to <span className="text-primary">Study Link</span>
      </h1>
      <p className="text-xl md:text-2xl max-w-3xl mb-8">
        Connect with students, share resources, and enhance your learning experience
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Link 
          to="/auth" 
          className="px-8 py-3 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
        >
          Get Started
        </Link>
        <Link 
          to="/about" 
          className="px-8 py-3 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/90 font-medium"
        >
          Learn More
        </Link>
      </div>
    </div>
  );
};

export default Hero; 