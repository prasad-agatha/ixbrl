import Head from "next/head";
import Layout from "layout";
import { useEffect, useState } from "react";
import { Spinner } from "@/components/loaders/Spinner";

export default function Profile({ user, mutate, router }) {
  const { isReady } = router;
  const [dt, setDt] = useState<any>({ ld: true });

  useEffect(() => {
    if (user && isReady) setDt({ ...dt, ld: false });
  }, [user, isReady]);

  return (
    <>
      <Head>
        <title>Profile</title>
      </Head>
      <Layout {...{ user, mutate, router }}>
        {dt.ld ? (
          <div className="flex-grow-1 h-100">
            <Spinner />
          </div>
        ) : (
          <div>Profile Page</div>
        )}
      </Layout>
    </>
  );
}
