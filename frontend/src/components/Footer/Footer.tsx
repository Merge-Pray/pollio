import { NavLink } from "react-router";

const Footer = () => {
  return (
    <footer>
      <div>
        <p>
          Leafio ist ein Projekt im Rahmen des Web Development Kurses beim DCI
          (April/Mai 2025) und nicht für den produktiven Betrieb gedacht.
        </p>
        <div>
          <NavLink to="/about">Über Leafio</NavLink>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
