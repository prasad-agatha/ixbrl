import Link from "next/link";
import { Modal } from "react-bootstrap";

export default function ForgotPassword() {
  return (
    <Modal show={true} centered backdrop="static" keyboard={false}>
      <Modal.Body>
        <div className="flex-center flex-column text-center gap-3">
          <img src="/icons/email.svg" alt="email" className="mt-4" />
          <div className="">
            <h6 className="fw-600">Password reset email sent!</h6>

            <h6 className="f-14 color-light">
              We have sent a password reset link to the <br />
              registered Email
            </h6>
          </div>
          <Link href="/auth" className="btn btn-primary f-14 px-5">
            Okay
          </Link>
        </div>
      </Modal.Body>
    </Modal>
  );
}
