import Sidebar from './Sidebar'
import Header from './Header'

const Layout = ({ children }) => {
  return (
    <div className="flex min-h-screen font-sans bg-white text-white">
      <div className="bg-black rounded-r-3xl shadow-lg border-r border-gray-800">
        <Sidebar />
      </div>
      <div className="flex flex-col flex-1 bg-black rounded-tl-3xl">
        <Header />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout
