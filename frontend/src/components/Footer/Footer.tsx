import { NavLink } from "react-router";

const Footer = () => {
  return (
    <footer className="flex justify-center items-center bg-white sm:p-1 text-gray-400">
      <div className="text-center text-xs">
        <p className="text-[10px]">
          pollio is a project as part of the web development course at DCI [July 2025].
        </p>
        <div>
          <NavLink to="/about">ABOUT POLLIO</NavLink>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
