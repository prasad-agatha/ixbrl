import { useEffect, useRef, useState } from "react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { Spinner } from "react-bootstrap";
import Reaptcha from "reaptcha";
import { toast } from "react-toastify";

import ForgotPassword from "@/components/modals/ForgotPassword";
import LoginCarousel from "@/components/carousel/LoginCarousel";
import UserService from "@/services/user.service";

const userService = new UserService();

export default function Login({ mutate, router }) {
  const captcha = useRef(null);
  const [toggle, setToggle] = useState(false);
  const [payload, setPayload] = useState<any>({ email: "", password: "" });
  const [errors, setErrors] = useState<any>({});
  const [type, setType] = useState("login");
  const [verified, setVerified] = useState(false);
  const [load, setLoad] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submit, setSubmit] = useState(false);

  const verifyCaptcha = async (data) => {
    try {
      await userService.verify({ captcha_response: data });
      setVerified(true);
    } catch (e) {
      resetCaptcha();
    }
  };
  const resetCaptcha = () => {
    captcha.current.reset();
    setVerified(false);
  };

  const handleSubmit = async () => {
    setSubmit(true);
    if (load || (type === "login" && !verified)) return;

    const err: any = {};
    Object.entries(payload).map(([k, v]: any) => {
      err[k] = !v
        ? "This field is required"
        : k == "email" && !new RegExp("[a-z0-9]+@[a-z]+.[a-z]{2,3}").test(v)
        ? "Invalid Email"
        : "";
    });
    setErrors(err);
    if (Object.values(err).join().replaceAll(",", "")) return;

    setLoad(true);
    try {
      if (type === "login") {
        await userService.login(payload);
        mutate();
      } else if (type === "forgot") {
        await userService.forgot(payload);
      } else if (type === "reset") {
        await userService.reset({ ...payload, resetToken: router.query.reset });
      }
      setSuccess(true);
    } catch (e) {
      toast.error(e || "Error");
    }
    setLoad(false);
  };

  const changeType = (ty) => {
    if (ty === "login" && type !== "login") resetCaptcha();
    setSubmit(false);
    setSuccess(false);
    setType(ty);
    const py =
      ty === "login"
        ? { email: payload?.email || "", password: "" }
        : ty === "forgot"
        ? { email: payload?.email || "" }
        : { newPassword: "", password: "" };
    setPayload(py);
    const err: any = {};
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Object.entries(py).map(([k, v]: any) => {
      err[k] = "";
    });
    setErrors(err);
  };

  useEffect(() => {
    if (router.query?.reset) changeType("reset");
    else if (router.query?.forgot !== undefined) changeType("forgot");
    else changeType("login");
  }, [router.query]);

  const onChange = (ty, vl) => {
    setPayload({ ...payload, [ty]: vl });
    setErrors({ ...errors, [ty]: "" });
  };

  const passwordDiv = (pl, ty) => (
    <div className="d-flex flex-column">
      <div className="input-div flex-between">
        <input
          placeholder={pl}
          className="pe-0"
          name="password"
          type={toggle ? "text" : "password"}
          value={payload[ty] || ""}
          onChange={(e) => onChange(ty, e.target.value)}
        />
        <Image
          src={`/icons/${!toggle ? "hide" : "show"}.svg`}
          alt=""
          width="48"
          height="48"
          onClick={() => setToggle(!toggle)}
        />
      </div>
      <div className={errors && errors[ty] ? "text-start" : "d-none"}>
        <span className="rounded-1 clr-danger bg-danger f-10 p-1">This field is required</span>
      </div>

      <Link
        href="/auth?forgot"
        className={type === "login" ? "d-inline clr-primary f-14 cr-p m-0 mt-2 ms-auto" : " d-none"}
      >
        Forgot password?
      </Link>
    </div>
  );
  return (
    <>
      <Head>
        <title>APEX iXBRL - Login</title>
      </Head>

      <div className="row h-100 m-0">
        <LoginCarousel />
        <div className="col-12 col-md-6 d-flex flex-column align-items-center justify-content-center ">
          <div className="login-form card">
            <div className="flex-center gap-3">
              <Image alt="logo" width={55} height={55} src="/logo.webp" />
              <span className="fw-600 f-24">APEX iXBRL</span>
            </div>

            <div>
              <h4 className={"clr-primary fw-bold" + (type === "login" ? "" : " d-none")}>
                Welcome back
              </h4>
              <h5 className="m-0">
                {type === "login"
                  ? "Login to your account"
                  : type === "forgot"
                  ? "Forgot Password"
                  : "Reset Password"}
              </h5>
            </div>

            {["login", "forgot"].includes(type) ? (
              <div className="text-start">
                <input
                  placeholder="Enter Email id"
                  name="email"
                  value={payload.email || ""}
                  onChange={(e) => onChange("email", e.target.value)}
                />
                <span
                  className={errors?.email ? "rounded-1 clr-danger bg-danger f-10 p-1" : "d-none"}
                >
                  {errors?.email}
                </span>
              </div>
            ) : (
              <>{passwordDiv("Enter New Password", "newPassword")}</>
            )}

            {type !== "forgot" && (
              <>{passwordDiv((type === "reset" ? "Re-" : "") + "Enter Password", "password")}</>
            )}

            <div className={type === "login" ? "captcha-small" : "d-none"}>
              <Reaptcha
                ref={(e) => (captcha.current = e)}
                sitekey={process.env.RECAPTCHA_SITE_KEY}
                size="compact"
                onVerify={verifyCaptcha}
                onExpire={resetCaptcha}
              />
            </div>
            <div className={type === "login" ? "captcha-large" : "d-none"}>
              <Reaptcha
                ref={(e) => (captcha.current = e)}
                sitekey={process.env.RECAPTCHA_SITE_KEY}
                size="normal"
                onVerify={verifyCaptcha}
                onExpire={resetCaptcha}
              />
              <div className={submit && !verified ? "text-start" : "d-none"}>
                <span className="rounded-1 clr-danger bg-danger f-10 p-1">Validate Captcha</span>
              </div>
            </div>

            <button style={{ height: "48px" }} className="btn btn-primary" onClick={handleSubmit}>
              {load && <Spinner animation="border" className="me-2 sp-1" />}
              {type === "login" ? "Login" : type === "forgot" ? "Send Email" : "Reset Password"}
            </button>
          </div>
          {type !== "login" && (
            <div className="text-center login-form p-0 m-0">
              {type === "reset" && success ? (
                <>
                  <h6 className={type === "reset" && success ? "flex-center gap-1" : "d-none"}>
                    <Image src="/icons/success.svg" alt="-" width="20" height="20" />
                    Your password reset is successful.
                  </h6>
                  You can{" "}
                  <Link href="/auth" className="clr-primary cr-p">
                    Login
                  </Link>{" "}
                  Now
                </>
              ) : (
                <>
                  &#8592; Back to{" "}
                  <Link href="/auth" className="clr-primary cr-p">
                    Login
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
        {type === "forgot" && success && <ForgotPassword />}
      </div>
    </>
  );
}
