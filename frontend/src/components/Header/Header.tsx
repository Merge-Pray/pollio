import { NavLink } from "react-router";

const Header = () => {
  return (
    <div className="flex flex-col justify-center items-center my-3">
      <NavLink to="/">
        <img src="./pollio_logo_s.png" alt="logo" className="h-14" />
      </NavLink>
      <p>simple.fast</p>
    </div>
  );
};
export default Header;
