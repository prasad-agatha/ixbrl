import Image from "next/image";
import { Popover, ListGroup, OverlayTrigger } from "react-bootstrap";
import UserService from "@/services/user.service";

const userService = new UserService();

export default function NavPopover({ user, mutate, router }) {
  const popover = (
    <Popover id="popover-basic">
      <Popover.Body className="p-0">
        <ListGroup className="border-0">
          {["Profile", "Log Out"].map((ele: any, id: any) => (
            <ListGroup.Item
              className="d-flex flex-row align-items-center cr-p popover-item"
              onClick={async () => {
                document.body.click();
                if (ele === "Profile") router.push("/profile");
                else {
                  await userService.removeCookie("accessToken");
                  mutate();
                }
              }}
              key={id}
            >
              <Image
                src={`/icons/${ele.toLowerCase().replace(" ", "-")}.svg`}
                alt="i"
                width={id !== 0 ? 18 : 22}
                height={id !== 0 ? 18 : 22}
              />
              <p className="ps-2 mb-0 color">{ele}</p>
            </ListGroup.Item>
          ))}
        </ListGroup>
      </Popover.Body>
    </Popover>
  );

  return (
    <OverlayTrigger rootClose trigger="click" placement="bottom" overlay={popover} transition>
      <span className="gap-1 nav-start">
        <Image alt="user" src="/icons/user.svg" width={38} height={38} />
        <span title={user?.name} className="f-ellipsis" style={{ maxWidth: "150px" }}>
          {user?.name}
        </span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 20 21"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M4.41107 7.22333C4.73651 6.89789 5.26414 6.89789 5.58958 7.22333L10.0003 11.6341L14.4111 7.22333C14.7365 6.89789 15.2641 6.89789 15.5896 7.22333C15.915 7.54876 15.915 8.0764 15.5896 8.40184L10.5896 13.4018C10.2641 13.7273 9.73651 13.7273 9.41107 13.4018L4.41107 8.40184C4.08563 8.0764 4.08563 7.54876 4.41107 7.22333Z"
            fill="#818896"
          />
        </svg>
      </span>
    </OverlayTrigger>
  );
}
