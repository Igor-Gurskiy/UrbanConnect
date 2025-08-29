import { NavLink } from "react-router-dom";
import type { FC } from "react";
import type { TAppHeader } from "./types";
import { Button, Image } from "antd";
import logo from "../../../images/logo.png";
export const AppHeader: FC<TAppHeader> = ({
  username,
  handleLogin,
  handleSignup,
  handleLogout,
}) => {
  return (
    <header className="p-3 container">
      <nav className="row border-bottom px-2 align-items-center">
        <div className="gap-4 col d-flex justify-content-start">
          <NavLink to={"/chat"}>
            <p className="text-center m-0">Chat</p>
          </NavLink>
          <NavLink to={"/map"}>
            <p className="text-center m-0">Map</p>
          </NavLink>
        </div>
        <div className="col-auto">
          <NavLink to={"/"}>
            <Image
              preview={false}
              src={logo}
              alt="logo"
              style={{ maxWidth: "100px" }}
            />
          </NavLink>
        </div>
        <div className="gap-4 col d-flex justify-content-end align-items-center">
          {username ? (
            <>
              <p className="text-center m-0">{username}</p>
              <Button type="default" onClick={handleLogout}>
                Log out
              </Button>
            </>
          ) : (
            <>
              <Button type="default" onClick={handleLogin}>
                Log in
              </Button>
              <Button type="default" onClick={handleSignup}>
                Sign up
              </Button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};
