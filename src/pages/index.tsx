import { SignInButton, useUser } from "@clerk/nextjs";
import Image from "next/image";

import { api } from "~/utils/api";

import LoadingPage, { LoadingSpinner } from "~/components/loading";
import { useState } from "react";
import toast from "react-hot-toast";
import PageLayout from "~/components/layout";
import PostView from "~/components/postView";

const CreatePostWizard = () => {
  const { user } = useUser();
  const [input, setInput] = useState("");

  const ctx = api.useContext();

  const { mutate, isLoading } = api.posts.create.useMutation({
    onSuccess: () => {
      setInput("");
      void ctx.posts.getAll.invalidate();
    },
    onError: (e) => {
      const postError = e.data?.zodError?.fieldErrors.content;
      if (!!postError && postError[0]) {
        toast.error(postError[0]);
      } else {
        toast.error("Failed to post! Please try again later.");
      }
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
        onKeyDown={(e) => {
          if (e.key == "Enter") {
            e.preventDefault();
            if (input !== "") {
              mutate({ content: input });
            }
          }
        }}
        disabled={isLoading}
      />
      {input !== "" && !isLoading && (
        <button onClick={() => mutate({ content: input })}>Post</button>
      )}
      {isLoading && (
        <div className="flex items-center justify-center">
          <LoadingSpinner size={30} />
        </div>
      )}
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
      <PageLayout>
        <div className="flex border-b border-b-white p-4">
          {!isSignedIn && <SignInButton />}
          {isSignedIn && <CreatePostWizard />}
        </div>
        <Feed />
      </PageLayout>
    </>
  );
}
