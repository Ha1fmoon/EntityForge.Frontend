import Sidebar from './Sidebar'

export default function Layout({currentPage, onNavigate, children}) {
    return (
        <div className="app-layout">
            <aside className="sidebar">
                <Sidebar currentPage={currentPage} onNavigate={onNavigate}/>
            </aside>
            <main className="content">
                {children}
            </main>
        </div>
    )
}