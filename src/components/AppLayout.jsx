// src/components/AppLayout.jsx
import { useState } from 'react';
import Header from './Header';
import Menu from './Menu';

const AppLayout = ({ children }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <div>
      <Header toggleMenu={toggleMenu} menuOpen={menuOpen} />
      {menuOpen && <Menu onClose={closeMenu} />}
      <main className="ml-64">{children}</main>
    </div>
  );
};

export default AppLayout;