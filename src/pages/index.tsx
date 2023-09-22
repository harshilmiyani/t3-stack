import { SignIn, useUser } from "@clerk/nextjs";
import Head from "next/head";
import Image from "next/image";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import { api } from "~/utils/api";
import type { RouterOutputs } from "~/utils/api";
import LoadingPage from "~/components/loading";
import { useState } from "react";

dayjs.extend(relativeTime);
type PostWithUser = RouterOutputs["posts"]["getAll"][number];

const PostView = (props: PostWithUser) => {
  const { post, author } = props;
  return (
    <div className="flex gap-3 border-b border-b-white p-4" key={post.id}>
      <Image
        alt="user image"
        className="rounded-full"
        src={author.imageUrl}
        width={50}
        height={50}
      />

      <div className="flex flex-col">
        <div className="flex gap-2">
          <span>{`@${author.username}`}</span>
          <span className="text-slate-400">
            {`· `}
            {dayjs(post.createdAt).fromNow()}
          </span>
        </div>
        <span className="text-xl">{post.content}</span>
      </div>
    </div>
  );
};

const CreatePostWizard = () => {
  const { user } = useUser();
  const [input, setInput] = useState("");

  const ctx = api.useContext();

  const { mutate, isLoading } = api.posts.create.useMutation({
    onSuccess: () => {
      setInput("");
      void ctx.posts.getAll.invalidate();
    },
  });

  if (!user) return null;
  return (
    <div className="flex w-full gap-4">
      <Image
        alt="user image"
        className="rounded-full "
        src={user.imageUrl}
        width={50}
        height={50}
      />
      <input
        placeholder="Type something emojis!"
        className="grow bg-transparent outline-none"
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={isLoading}
      />
      <button onClick={() => mutate({ content: input })}>Post</button>
    </div>
  );
};

const Feed = () => {
  const { data, isLoading: postLoading } = api.posts.getAll.useQuery();

  if (postLoading) return <LoadingPage />;
  if (!data) return <div>Some went wrong</div>;

  return (
    <div className="flex flex-col ">
      {data?.map((postInfo) => (
        <PostView {...postInfo} key={postInfo.post.id} />
      ))}
    </div>
  );
};

export default function Home() {
  const { isLoaded: userLoaded, isSignedIn } = useUser();
  api.posts.getAll.useQuery();

  if (!userLoaded) return <div />;

  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex h-screen justify-center">
        <div className=" h-full w-full border-x  md:max-w-2xl">
          <div className="flex border-b border-b-white p-4">
            {!isSignedIn && <SignIn />}
            {isSignedIn && <CreatePostWizard />}
          </div>
          <Feed />
        </div>
      </main>
    </>
  );
}
