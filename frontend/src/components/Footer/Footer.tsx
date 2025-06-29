import { NavLink } from "react-router";

const Footer = () => {
  return (
    <footer className="flex justify-center items-center bg-white">
      <div className="text-center text-xs">
        <p>
          pollio ist ein Projekt im Rahmen des Web Development Kurses beim DCI
          (Juli 2025).
        </p>
        <div>
          <NavLink to="/about">Über pollio</NavLink>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
