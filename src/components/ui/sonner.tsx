import { Toaster as Sonner } from "sonner"
import { useThemeStore } from "@/store/useThemeStore"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
    const mode = useThemeStore((state) => state.mode)

    return (
        <Sonner
            theme={mode}
            className="toaster group"
            toastOptions={{
                classNames: {
                    toast:
                        "group toast group-[.toaster]:bg-card group-[.toaster]:text-card-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
                    description: "group-[.toast]:text-muted-foreground",
                    actionButton:
                        "group-[.toast]:bg-cyan-500 group-[.toast]:text-[#030408] group-[.toast]:font-black",
                    cancelButton:
                        "group-[.toast]:bg-secondary group-[.toast]:text-secondary-foreground",
                },
            }}
            {...props}
        />
    )
}

export { Toaster }
