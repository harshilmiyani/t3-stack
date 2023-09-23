import type { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import { appRouter } from "~/server/api/root";
import { api } from "~/utils/api";

const ProfileFeed = (props: { userId: string }) => {
  const { data, isLoading } = api.posts.getProfileByUserId.useQuery({
    userId: props.userId,
  });
  if (isLoading) return <LoadingPage />;
  if (!data) return <div>User has not posted.</div>;

  return (
    <div className="flex flex-col">
      {data.map((fullPost) => (
        <PostView {...fullPost} key={fullPost.post.id} />
      ))}
    </div>
  );
};

const ProfilePage: NextPage<{ username: string }> = ({ username }) => {
  const { data } = api.profile.getUserByUsername.useQuery({
    username,
  });

  if (!data) return <div>Something went wrong.</div>;
  return (
    <>
      <Head>
        <title>{data.username}</title>
        <meta name="description" content="💭" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <PageLayout>
        <div className="relative h-48 bg-slate-600">
          <Image
            src={data.imageUrl}
            alt={`${data.username} profile image`}
            height={128}
            width={128}
            className="absolute bottom-0 left-0 right-0 -mb-[64px] ml-4 rounded-full border-4 border-black"
          />
        </div>
        <div className="h-[64px]" />
        <div className="p-4 text-2xl font-bold">{`@${
          data.username ?? ""
        }`}</div>
        <div className="w-full border-b border-slate-400" />
        <ProfileFeed userId={data.id} />
      </PageLayout>
    </>
  );
};

import { createServerSideHelpers } from "@trpc/react-query/server";
import { db } from "~/server/db";
import superjson from "superjson";
import PageLayout from "~/components/layout";
import Image from "next/image";
import LoadingPage from "~/components/loading";
import PostView from "~/components/postView";

export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = createServerSideHelpers({
    router: appRouter,
    ctx: { db, userId: null },
    transformer: superjson,
  });
  const slug = context.params?.slug;
  if (typeof slug !== "string") throw new Error("no slug");

  const username = slug.replace("@", "");

  await ssg.profile.getUserByUsername.prefetch({ username });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      username,
    },
  };
};

export const getStaticPaths = () => {
  return { paths: [], fallback: "blocking" };
};

export default ProfilePage;
