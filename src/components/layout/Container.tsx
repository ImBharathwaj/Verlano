import { ReactNode } from "react";

type ContainerProps = {
  children: ReactNode;
};

export function Container({ children }: ContainerProps) {
  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-8 py-10">
      {children}
    </div>
  );
}

