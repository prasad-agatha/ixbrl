import { OverlayTrigger, Tooltip } from "react-bootstrap";

export default function ToolTip({ cls, txt }) {
  return (
    <OverlayTrigger placement="top" overlay={<Tooltip className="tooltip">{txt}</Tooltip>}>
      <span className={cls}>{txt}</span>
    </OverlayTrigger>
  );
}
