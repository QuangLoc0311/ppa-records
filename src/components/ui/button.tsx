import * as React from "react"
import { cn } from "../../lib/utils"
import { buttonVariants } from "./button-variants"
import type { ButtonProps } from "./button-types"

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button } 