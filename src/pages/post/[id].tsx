import Head from "next/head";
import PageLayout from "~/components/layout";

const SinglePostPage = () => {
  return (
    <>
      <Head>
        <title>Post</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <PageLayout>
        <div className=" h-full w-full border-x  md:max-w-2xl">Post View</div>
      </PageLayout>
    </>
  );
};

export default SinglePostPage;
