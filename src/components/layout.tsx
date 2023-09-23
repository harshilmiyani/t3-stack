import type { PropsWithChildren } from "react";

const PageLayout = (props: PropsWithChildren) => {
  return (
    <main className="flex h-screen justify-center">
      <div className=" h-full w-full overflow-y-scroll  border-x md:max-w-2xl">
        <div>{props.children}</div>
      </div>
    </main>
  );
};

export default PageLayout;
