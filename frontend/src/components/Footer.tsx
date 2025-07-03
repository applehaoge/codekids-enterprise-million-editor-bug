export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-blue-900 to-purple-900 text-white mt-auto w-full">
      <div className="container mx-auto p-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <h3 className="mb-4 text-xl font-bold">关于CodeKids</h3>
            <p className="text-green-200">
              专为6-12岁儿童设计的编程学习平台，通过游戏化方式培养编程兴趣。
            </p>
          </div>
          <div>
            <h3 className="mb-4 text-xl font-bold">联系我们</h3>
            <ul className="space-y-2">
              <li>
                <a href="mailto:contact@codekids.com" className="text-green-200 hover:text-orange-300">
                  <i className="fa-solid fa-envelope mr-2"></i>contact@codekids.com
                </a>
              </li>
              <li>
                <a href="tel:+1234567890" className="text-green-200 hover:text-orange-300">
                  <i className="fa-solid fa-phone mr-2"></i>123-456-7890
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-xl font-bold">关注我们</h3>
            <div className="flex gap-4">
              <a href="#" className="text-green-200 hover:text-orange-300">
                <i className="fa-brands fa-facebook text-2xl"></i>
              </a>
              <a href="#" className="text-green-200 hover:text-orange-300">
                <i className="fa-brands fa-twitter text-2xl"></i>
              </a>
              <a href="#" className="text-green-200 hover:text-orange-300">
                <i className="fa-brands fa-instagram text-2xl"></i>
              </a>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-green-700 pt-4 text-center text-green-300">
          <p>© 2025 CodeKids. 保留所有权利。</p>
        </div>
      </div>
    </footer>
  );
}