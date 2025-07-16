import { NavLink } from "react-router";

const Footer = () => {
  return (
    <footer className="flex justify-center items-center bg-white sm:p-1 text-gray-400">
      <div className="text-center text-xs">
        <p className="text-[10px]">
          Pollio is a project as part of the web development course at DCI [July
          2025].
        </p>

        <div className="flex gap-4">
          <NavLink to="/about">About Pollio</NavLink>
          <NavLink to="/legalnotice">Legal Notice</NavLink>
          <NavLink to="/gtc">General Terms and Conditions</NavLink>
          <NavLink to="/dataprivacy">Data Privacy</NavLink>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
