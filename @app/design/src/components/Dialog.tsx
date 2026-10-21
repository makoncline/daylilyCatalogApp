import * as DialogPrimitive from "@radix-ui/react-dialog";
import React, { useRef } from "react";
import styled from "styled-components";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: React.ReactNode;
};

export function Dialog({ open, onOpenChange, title, children }: Props) {
  const previousFocus = useRef<HTMLElement | null>(null);
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <Overlay />
        <Content
          aria-describedby={undefined}
          onOpenAutoFocus={() => {
            previousFocus.current =
              document.activeElement as HTMLElement | null;
          }}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            previousFocus.current?.focus();
          }}
        >
          <DialogPrimitive.Title
            style={{
              position: "absolute",
              width: 1,
              height: 1,
              overflow: "hidden",
              clipPath: "inset(50%)",
            }}
          >
            {title}
          </DialogPrimitive.Title>
          {children}
        </Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

const Overlay = styled(DialogPrimitive.Overlay)`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.33);
  z-index: 1000;
`;
const Content = styled(DialogPrimitive.Content)`
  position: fixed;
  top: 10vh;
  left: 50%;
  transform: translateX(-50%);
  width: min(50vw, 100% - 2rem);
  max-height: 80vh;
  overflow: auto;
  padding: 2rem;
  z-index: 1001;
  background-color: var(--surface-1);
`;
