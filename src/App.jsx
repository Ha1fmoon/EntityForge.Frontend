import {useState} from 'react'
import Layout from './components/Layout'
import MainPage from './pages/MainPage'
import EntitiesPage from './pages/EntitiesPage'
import TypesPage from './pages/TypesPage'

function App() {
    const [page, setPage] = useState('Main')
    const [mainKey, setMainKey] = useState(0)

    function handleNavigate(newPage) {
        if (newPage === 'Main') {
            setMainKey(k => k + 1)
        }
        setPage(newPage)
    }

    let content = null
    switch (page) {
        case 'Entities':
            content = <EntitiesPage/>
            break
        case 'Types':
            content = <TypesPage/>
            break
        case 'Main':
        default:
            content = <MainPage key={mainKey}/>
    }

    return (
        <Layout currentPage={page} onNavigate={handleNavigate}>
            {content}
        </Layout>
    )
}

export default App