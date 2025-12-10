import type { FC } from "react";

export type ColorSwatchProps = {
  colorHex: string;
  label?: string;
  selected?: boolean;
  onSelect?: () => void;
  size?: number; // px
};

export const ColorSwatch: FC<ColorSwatchProps> = ({
  colorHex,
  label,
  selected = false,
  onSelect,
  size = 24,
}) => (
  <button
    type="button"
    aria-label={label ? `Color ${label}` : "Color"}
    className={`rounded-full ring-1 ring-black/10 transition ${
      selected ? "outline outline-2 outline-pink-500" : "hover:scale-105"
    }`}
    style={{ width: size, height: size, backgroundColor: colorHex }}
    onClick={onSelect}
    onMouseEnter={onSelect}
  />
);
