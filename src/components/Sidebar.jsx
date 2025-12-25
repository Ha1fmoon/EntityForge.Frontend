const MENU_ITEMS = ['Main', 'Entities', 'Types']

export default function Sidebar({currentPage, onNavigate}) {
    return (
        <nav className="menu">
            {MENU_ITEMS.map((item) => (
                <button
                    key={item}
                    className={`menu-item${currentPage === item ? ' active' : ''}`}
                    onClick={() => onNavigate(item)}
                    type="button"
                >
                    {item}
                </button>
            ))}
        </nav>
    )
}