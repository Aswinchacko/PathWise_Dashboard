
const Sidebar = ({ categories, selectedCategory, setSelectedCategory }) => (
  <aside className="community-sidebar">
    <div className="sidebar-section">
      <h4>Categories</h4>
      <ul>
        <li
          className={!selectedCategory ? 'active' : ''}
          onClick={() => setSelectedCategory(null)}
        >
          All
        </li>
        {categories.map((category) => (
          <li
            key={category}
            className={selectedCategory === category ? 'active' : ''}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </li>
        ))}
      </ul>
    </div>
  </aside>
);

export default Sidebar;
