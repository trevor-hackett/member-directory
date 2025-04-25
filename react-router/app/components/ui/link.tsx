import { type LinkProps, Link as RouterLink } from "react-router";

export function Link(props: LinkProps) {
  return (
    <RouterLink
      {...props}
      state={{
        ...props.state,
        canGoBack: true,
      }}
    />
  );
}
