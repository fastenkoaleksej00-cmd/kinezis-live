import { buttonStyles, type ButtonSize, type ButtonVariant } from "./buttonStyles";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function Button({ variant = "primary", size = "md", className, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={buttonStyles(variant, size, className)} {...props} />;
}
