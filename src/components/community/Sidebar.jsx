import { LayoutGrid, Code2, BarChart3, Briefcase, Cpu, Smartphone, Cloud } from 'lucide-react';

const iconFor = (label) => {
  const map = {
    'Web Development': Code2,
    'Data Science': BarChart3,
    'Career Advice': Briefcase,
    Development: Cpu,
    'Mobile Development': Smartphone,
    DevOps: Cloud,
  };
  return map[label] || LayoutGrid;
};

const Sidebar = ({ categories, selectedCategory, setSelectedCategory }) => (
  <aside className="community-sidebar">
    <div className="sidebar-brand">
      <span className="sidebar-brand__mark" />
      <div>
        <div className="sidebar-brand__title">Feed</div>
        <div className="sidebar-brand__sub">Categories</div>
      </div>
    </div>
    <nav className="sidebar-nav" aria-label="Discussion categories">
      <button
        type="button"
        className={`sidebar-pill ${!selectedCategory ? 'sidebar-pill--active' : ''}`}
        onClick={() => setSelectedCategory(null)}
      >
        <LayoutGrid size={18} strokeWidth={1.75} />
        <span>All topics</span>
      </button>
      {categories.map((category) => {
        const Icon = iconFor(category);
        return (
          <button
            key={category}
            type="button"
            className={`sidebar-pill ${selectedCategory === category ? 'sidebar-pill--active' : ''}`}
            onClick={() => setSelectedCategory(category)}
          >
            <Icon size={18} strokeWidth={1.75} />
            <span>{category}</span>
          </button>
        );
      })}
    </nav>
  </aside>
);

export default Sidebar;
