import { useRef, useEffect } from "react";

export const useRowchange = ({ index, setRowHeight }: { index: number, setRowHeight: (index: number, height: number) => void }) => {
    const rowRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (rowRef.current) {
            setRowHeight(index, rowRef.current.offsetHeight)
        }
    }, [rowRef])
    return rowRef
}

