import Link from "next/link";
import Image from "next/image";
import NavPopover from "components/popover/NavPopover";
import { Nav, Navbar, NavbarBrand } from "react-bootstrap";
import { hideNav } from "@/common/functions";

export default function Layout({ user, mutate, router, children }) {
  return (
    <>
      <header className="top-nav">
        <Navbar collapseOnSelect expand="md">
          <div className="container">
            <NavbarBrand href="/dashboard" className="me-0">
              <span className="gap-2 navbar-brand nav-start me-0">
                <Image alt="logo" width={24} height={24} src="/logo.webp" />
                <span>APEX iXBRL</span>
              </span>
            </NavbarBrand>
            <Navbar.Toggle
              aria-controls="navbarScroll"
              data-bs-toggle="collapse"
              data-bs-target="#navbarScroll"
            />
            <Navbar.Collapse id="navbarScroll">
              <Nav className="align-items-center ms-auto">
                {[
                  { name: "Users", link: "/users" },
                  { name: "Service Providers", link: "/serviceProviders" },
                  { name: "Clients", link: "/clients" },
                  { name: "Dashboard", link: "/dashboard" },
                  { name: "My Files", link: "/my-files" },
                  { name: "Help", link: "/help" },
                ].map((e, id) => (
                  <div className={hideNav(e.name, user) ? "d-none" : "nav-link"} key={id}>
                    <Link href={e.link} className={router.pathname === e.link ? " active" : ""}>
                      {e.name}
                    </Link>
                  </div>
                ))}
                <NavPopover {...{ user, mutate, router }} />
              </Nav>
            </Navbar.Collapse>
          </div>
        </Navbar>
      </header>

      <div className="d-flex overflow-auto" style={{ paddingTop: "56px", height: "100%" }}>
        <div className="main-section">{children}</div>
      </div>
    </>
  );
}
