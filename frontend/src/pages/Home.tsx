import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="min-h-[calc(100vh-65px)]">
      <section className="py-20 px-4 md:px-6 bg-black text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="space-y-8">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              Connect, Collaborate, and Learn Together
            </h1>
            <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto">
              Join StudyLink, the platform that brings students together for
              collaborative learning, resource sharing, and academic success.
            </p>
            <div className="flex flex-wrap gap-6 pt-4 justify-center">
              <Link
                to="/auth"
                className="px-8 py-3 bg-white text-black font-medium rounded-lg hover:bg-gray-200 transition-colors"
              >
                Get Started
              </Link>
              <Link
                to="/about"
                className="px-8 py-3 bg-transparent border border-white text-white font-medium rounded-lg hover:bg-white/10 transition-colors"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 md:px-6 bg-white">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Choose StudyLink?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 bg-gray-50 rounded-lg">
              <h3 className="text-xl font-semibold mb-3">
                Collaborative Learning
              </h3>
              <p className="text-gray-600">
                Connect with peers to share knowledge and solve problems
                together.
              </p>
            </div>
            <div className="p-6 bg-gray-50 rounded-lg">
              <h3 className="text-xl font-semibold mb-3">Resource Sharing</h3>
              <p className="text-gray-600">
                Access and share study materials, notes, and helpful resources.
              </p>
            </div>
            <div className="p-6 bg-gray-50 rounded-lg">
              <h3 className="text-xl font-semibold mb-3">Academic Growth</h3>
              <p className="text-gray-600">
                Track your progress and achieve your educational goals faster.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
