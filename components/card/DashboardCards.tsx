import Image from "next/image";
import Link from "next/link";

export default function DashboardCards() {
  return (
    <div className="cards-section d-flex flex-wrap flex-lg-nowrap gap-3">
      <div>
        <h6 className="fw-600">Convert Files</h6>
        <p className="f-l f-12">Start the conversion process for new HTML files,</p>
        <Link className="bg-white btn f-12 fw-500 mt-auto" href="/new-file">
          New File
        </Link>
      </div>

      <div>
        <p className="color-light f-12 mb-2">Files</p>
        <h5 className="d-flex align-items-center">
          <span className="fw-bold f-18">0</span>&nbsp;
          {/* <span
            className="fw-bold f-10 clr-success bg-success px-1 rounded-1"
            style={{ lineHeight: "18px" }}
          >
            &#x2022; 12.5%
          </span> */}
        </h5>
        <p className="color-light f-l f-12">
          You have converted 0 files to iXBRL format, ensuring compliance with SEC regulations.
        </p>
        {/* <Link href="/my-files" className="clr-primary cr-p f-12 fw-500 mt-auto">
          View Files
        </Link> */}
      </div>

      <div>
        <Image src="/dashboard/1.svg" alt="-" width={24} height={24} className="mb-3" />
        <h6 className="f-14 fw-600">View Converted Reports</h6>
        <p className="color-light f-l f-12">Access and review the converted iXBRL reports.</p>
        {/* <Link href="/my-files" className="clr-primary cr-p f-12 fw-500 mt-auto">
          View Converted Files
        </Link> */}
      </div>

      <div>
        <Image src="/dashboard/2.svg" alt="-" width={24} height={24} className="mb-3" />
        <h6 className="f-14 fw-600">Configure Taxonomies</h6>
        <p className="color-light f-l f-12">
          Customize the taxonomies and mapping rules for accurate conversions.
        </p>
      </div>
    </div>
  );
}
