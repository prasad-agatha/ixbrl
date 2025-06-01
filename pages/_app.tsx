import React, { useEffect } from "react";
import { AppProps } from "next/app";
import { useRouter } from "next/router";
import { ToastContainer } from "react-toastify";
import "config/axios_configuration";
import "styles/App.scss";
import useUser from "@/hooks/useUser";

function MyApp(props: AppProps) {
  const router = useRouter();
  const { loginStatus, user, mutate } = useUser();
  const { Component, pageProps, err }: any = props;
  const Layout = Component.Layout || React.Fragment;
  const modifiedPageProps = { ...pageProps, loginStatus, user, mutate, router, err };

  useEffect(() => {
    if (["/", "/auth"].includes(router.pathname) && loginStatus === "loggedIn")
      router.push(`/dashboard`);

    if (!["/auth"].includes(router.pathname) && loginStatus === "loggedOut")
      router.replace("/auth");
  }, [user, loginStatus, router.asPath]);

  return (
    <Layout>
      <ToastContainer theme="colored" />
      <Component {...modifiedPageProps} />
    </Layout>
  );
}

export default MyApp;
