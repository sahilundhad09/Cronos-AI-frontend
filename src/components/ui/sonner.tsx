import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
    return (
        <Sonner
            theme="dark"
            className="toaster group"
            toastOptions={{
                classNames: {
                    toast:
                        "group toast group-[.toaster]:bg-[#0A0D18] group-[.toaster]:text-white group-[.toaster]:border-white/10 group-[.toaster]:shadow-lg",
                    description: "group-[.toast]:text-slate-400",
                    actionButton:
                        "group-[.toast]:bg-cyan-500 group-[.toast]:text-[#030408] group-[.toast]:font-black",
                    cancelButton:
                        "group-[.toast]:bg-white/5 group-[.toast]:text-slate-400",
                },
            }}
            {...props}
        />
    )
}

export { Toaster }
