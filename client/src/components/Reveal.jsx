import { useReveal } from "../hooks/useReveal";

export default function Reveal({
  as: Tag = "div",
  threshold = 0.1,
  delay = 0,
  className = "",
  style,
  children,
  ...rest
}) {
  const [ref, visible] = useReveal(threshold);

  return (
    <Tag
      ref={ref}
      className={`reveal ${visible ? "is-in" : ""} ${className}`.trim()}
      style={delay ? { ...style, transitionDelay: `${delay}ms` } : style}
      {...rest}
    >
      {children}
    </Tag>
  );
}