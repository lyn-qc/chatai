"use client";

import { useRef, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";

interface PaybtnProps {
    price: number;
}

export default function Paybtn({ price: initialPrice }: PaybtnProps) {
    const [price, setPrice] = useState(initialPrice);
    let oForm = useRef(null);
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const priceParam = searchParams.get('price');
        if (priceParam) {
            setPrice(Number(priceParam));
        }
    }, [searchParams]);

    // 前端改造
    const processPayment = async () => {
        try {
            const { data: formHtml } = await axios.post(`http://localhost:3001/alipay?price=${price}`);
            const div = document.createElement('div');
            div.innerHTML = formHtml;
            document.body.appendChild(div);
            (div.querySelector('form') as HTMLFormElement)?.submit();
        } catch (err) {
            console.error('支付失败:', err);
        }
    }

    return (
        <button className="btn mt-8 block rounded-md px-3.5 py-2.5 text-center text-sm font-semibold text-indigo-600 ring-1 ring-indigo-200 ring-inset hover:ring-indigo-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:mt-10" onClick={() => processPayment()}>立即订阅</button>
    )
} 