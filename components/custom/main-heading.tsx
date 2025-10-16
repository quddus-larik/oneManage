
export function TitleHeader({ label, span }: { label: string, span: string }) {

    return (
        <div className="flex gap-1 flex-col">
            <h1 className="text-xl">{label}</h1>
            <p className="text-muted-foreground">{span}</p>
        </div>
    )
}