import { Routes, Route, NavLink, Navigate } from 'react-router-dom'
import { useTreeStore } from './shared/store'
import TreeScene from './features/galaxy/TreeScene'
import MetroMap from './features/metro/MetroMap'
import NodePanel from './features/node-panel/NodePanel'
import ExtensionShelf from './features/extensions/ExtensionShelf'
import Catalog from './features/catalog/Catalog'
import Loader from './features/loader/Loader'
import UserPanel from './features/user/UserPanel'
import { Map, Sparkles, User } from 'lucide-react'

const navCls = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-1.5 px-3 py-1 rounded transition-colors text-xs ${isActive ? 'bg-white/10 text-white' : 'text-white/30 hover:text-white/50'}`

function TreeView({ galaxy }: { galaxy?: boolean }) {
  const { def, nodes } = useTreeStore()
  if (!def) return null
  return (
    <>
      {galaxy ? <TreeScene /> : <MetroMap />}
      <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5 pointer-events-none">
        {Object.entries(def.branches).map(([branch, { color, label }]) => {
          if (!nodes.some(n => n.branch === branch)) return null
          return (
            <span key={branch} className="text-[10px] px-2 py-0.5 rounded-full bg-black/60 text-white flex items-center gap-1">
              <span className={`w-2 h-2 ${branch === 'bridge' ? 'rotate-45' : 'rounded-full'}`}
                style={{ background: color }} />
              {label}
            </span>
          )
        })}
      </div>
      <NodePanel />
    </>
  )
}

function TreeShell() {
  const { def, nodes, edges } = useTreeStore()
  if (!def) return <Navigate to="/" replace />

  return (
    <div className="h-screen w-screen flex flex-col select-none">
      <header className="flex items-center justify-between px-4 h-11 shrink-0 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <h1 className="text-white text-sm font-bold leading-none">{def.title}</h1>
          <span className="text-white/20 text-[10px]">{nodes.length} węzłów · {edges.length} połączeń</span>
        </div>
        <div className="flex items-center gap-2">
          <ExtensionShelf />
          <nav className="flex items-center gap-0.5 rounded bg-white/[0.04] p-0.5">
            <NavLink to="/metro" className={navCls}><Map size={12} /> Metro</NavLink>
            <NavLink to="/galaxy" className={navCls}><Sparkles size={12} /> Galaxy</NavLink>
            <NavLink to="/profile" className={navCls}><User size={12} /> Profil</NavLink>
          </nav>
        </div>
      </header>

      <main className="flex-1 relative min-h-0">
        <Routes>
          <Route path="metro" element={<TreeView />} />
          <Route path="galaxy" element={<TreeView galaxy />} />
          <Route path="profile" element={<UserPanel />} />
          <Route path="*" element={<Navigate to="metro" replace />} />
        </Routes>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Catalog />} />
      <Route path="/load/:org/:repo" element={<Loader />} />
      <Route path="/*" element={<TreeShell />} />
    </Routes>
  )
}
