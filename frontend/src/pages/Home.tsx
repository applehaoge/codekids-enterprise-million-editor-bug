import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Carousel from '@/components/Carousel';
import FeatureCards from '@/components/FeatureCards';
import Showcase from '@/components/Showcase';
import Reward from '@/components/Reward';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 font-comic" style={{ fontFamily: 'Comic Sans MS, Comic Sans, cursive' }}>
      <Header />
      <main className="container mx-auto px-4 py-8 bg-black bg-opacity-20 rounded-lg">
        <Carousel />
        <Reward />
        <div className="mb-12">
          <h2 className="mb-6 text-3xl font-bold text-yellow-300">🚀 核心功能 - 热更新测试 🚀</h2>
          <FeatureCards />
        </div>
        <Showcase />
      </main>
      <Footer />
    </div>
  );
}