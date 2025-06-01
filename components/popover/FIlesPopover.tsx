import { hasPermission } from "@/common/functions";
import Image from "next/image";
import { useRouter } from "next/router";
import { Popover, ListGroup, OverlayTrigger } from "react-bootstrap";

export default function FilesPopover({ user, row, onDelete }) {
  const router = useRouter();
  const popover = (
    <Popover id="popover-basic">
      <Popover.Body className="p-0">
        <ListGroup className="border-0">
          {["Edit", "Download package", "Delete"].map((ele: any, id: any) => (
            <ListGroup.Item
              className={
                hasPermission(user, ele.split(" ")[0].toLowerCase())
                  ? "d-flex flex-row align-items-center cr-p popover-item"
                  : "d-none"
              }
              onClick={async () => {
                document.body.click();
                if (ele === "Edit") router.push(`/my-files/${row?.id}`);
                if (ele === "Delete") onDelete(row);
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
