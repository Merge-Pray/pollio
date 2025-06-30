import { NavLink } from "react-router";

const Footer = () => {
  return (
    <footer className="flex justify-center items-center bg-white sm:p-1">
      <div className="text-center text-xs">
        <p className="text-[10px]">
          pollio ist ein Projekt im Rahmen des Web Development Kurses beim DCI
          [Juli 2025].
        </p>
        <div>
          <NavLink to="/about">ÜBER POLLio</NavLink>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
