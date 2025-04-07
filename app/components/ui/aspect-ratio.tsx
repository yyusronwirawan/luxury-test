"use client"

import * as AspectRatioPrimitive from "@radix-ui/react-aspect-ratio"
import type React from "react"

interface AspectRatioProps extends React.ComponentPropsWithoutRef<typeof AspectRatioPrimitive.Root> {
  className?: string
}

const AspectRatio = ({ className, ...props }: AspectRatioProps) => (
  <AspectRatioPrimitive.Root className={className} {...props} />
)
AspectRatio.displayName = AspectRatioPrimitive.Root.displayName

export { AspectRatio }

