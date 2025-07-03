import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Carousel from '@/components/Carousel';
import FeatureCards from '@/components/FeatureCards';
import Showcase from '@/components/Showcase';
import Reward from '@/components/Reward';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-800 via-purple-700 to-blue-900 font-comic" style={{ fontFamily: 'Comic Sans MS, Comic Sans, cursive' }}>
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Carousel />
        <Reward />
        <div className="mb-12">
          <h2 className="mb-6 text-3xl font-bold text-white">核心功能</h2>
          <FeatureCards />
        </div>
        <Showcase />
      </main>
      <Footer />
    </div>
  );
}