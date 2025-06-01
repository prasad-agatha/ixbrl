import { exclude } from "@/common/functions";
import { userPermissions } from "@/db/constants";
import Image from "next/image";
import { Popover, ListGroup, OverlayTrigger } from "react-bootstrap";

export default function UsersPopover({ setModal, row, onDelete }) {
  const popover = (
    <Popover id="popover-basic">
      <Popover.Body className="p-0">
        <ListGroup className="border-0">
          {["Edit", "Delete"].map((ele: any, id: any) => (
            <ListGroup.Item
              className={
                ele === "Delete" && row?.globalSuperAdmin
                  ? "d-none"
                  : "d-flex flex-row align-items-center cr-p popover-item"
              }
              onClick={async () => {
                document.body.click();
                if (ele === "Edit") {
                  const type = row.profile.type;
                  const permissions = row.permissions || { ...userPermissions() };
                  const user = { ...row, type, permissions };
                  user[`${type}Id`] = row.profile?.id
                    ? { label: row.profile.name, value: row.profile.id }
                    : null;
                  const data = exclude(user, ["lastLogin", "profile"]);
                  setModal({ show: true, data, type: "Update" });
                } else onDelete(row);
              }}
              key={id}
            >
              <Image
                src={`/icons/${ele.toLowerCase().replace(" ", "-")}.svg`}
                alt="i"
                width={21}
                height={21}
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
      <Image alt="-" src="/icons/actions.svg" className="cr-p" width={24} height={24} />
    </OverlayTrigger>
  );
}
