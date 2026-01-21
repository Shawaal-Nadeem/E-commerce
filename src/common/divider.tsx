type DividerProps = {
  className?: string;
};

export function Divider({ className }: DividerProps = {}) {
  return (
    <hr className={className || "h-2 w-24 rounded-md bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600"} />
  );
}
