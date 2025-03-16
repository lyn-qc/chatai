import { Suspense } from 'react';
import Paybtn from "../Components/Paybtn";

export default function Pay() {
    return (
        <div className="page-pay">
            <div className="relative isolate bg-white px-6 py-24 sm:py-32 lg:px-8">
                <div className="absolute inset-x-0 -top-3 -z-10 transform-gpu overflow-hidden px-36 blur-3xl" aria-hidden="true">
                    <div className="mx-auto aspect-1155/678 w-[72.1875rem] bg-linear-to-tr from-[#ff80b5] to-[#9089fc] opacity-30" style={{ clipPath: "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)" }}></div>
                </div>
                <div className="mx-auto max-w-4xl text-center w-screen">
                    <h2 className="text-base/7 font-semibold text-indigo-600  w-screen">订阅计划</h2>
                    <p className="mt-2 text-5xl font-semibold tracking-tight  w-screen text-balance text-gray-900 sm:text-6xl">选择适合您的ChatAI服务方案</p>
                </div>

                <div className="mx-auto mt-16 grid max-w-lg grid-cols-1 items-center gap-y-6 sm:mt-20 sm:gap-y-0 lg:max-w-4xl lg:grid-cols-2">
                    {/* 基础版套餐 */}
                    <div className="pay-card-left rounded-3xl rounded-t-3xl bg-white/60 p-8 ring-1 ring-gray-900/10 sm:mx-8 sm:rounded-b-none sm:p-10 lg:mx-0 lg:rounded-tr-none lg:rounded-bl-3xl">
                        <h3 id="tier-basic" className="text-base/7 font-semibold text-indigo-600">基础版</h3>
                        <p className="mt-4 flex items-baseline gap-x-2">
                            <span className="text-5xl font-semibold tracking-tight text-gray-900">¥6</span>
                            <span className="text-base text-gray-500">/月</span>
                        </p>
                        <p className="mt-6 text-base/7 text-gray-600">适合个人开发者和小型团队的入门方案</p>
                        <ul role="list" className="mt-8 space-y-3 text-sm/6 text-gray-600 sm:mt-10">
                            <li className="flex gap-x-3">
                                <svg className="h-6 w-5 flex-none text-indigo-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                                </svg>
                                每月900次API调用
                            </li>
                            <li className="flex gap-x-3">
                                <svg className="h-6 w-5 flex-none text-indigo-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                                </svg>
                                专有模型访问权限
                            </li>
                            <li className="flex gap-x-3">
                                <svg className="h-6 w-5 flex-none text-indigo-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                                </svg>
                                标准响应速度（≤3秒）
                            </li>
                            <li className="flex gap-x-3">
                                <svg className="h-6 w-5 flex-none text-indigo-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                                </svg>
                                基础技术客服支持
                            </li>
                        </ul>
                        <Suspense fallback={<div>Loading...</div>}>
                            <Paybtn price={6} />
                        </Suspense>
                    </div>

                    {/* 高级版套餐 */}
                    <div className="pay-card-right relative rounded-3xl bg-gray-900 p-8 ring-1 shadow-2xl ring-gray-900/10 sm:p-10">
                        <h3 id="tier-pro" className="text-base/7 font-semibold text-indigo-400">高级版</h3>
                        <p className="mt-4 flex items-baseline gap-x-2">
                            <span className="text-5xl font-semibold tracking-tight text-white">¥18</span>
                            <span className="text-base text-gray-400">/月</span>
                        </p>
                        <p className="mt-6 text-base/7 text-gray-300">满足企业级需求的高性能方案</p>
                        <ul role="list" className="mt-8 space-y-3 text-sm/6 text-gray-300 sm:mt-10">
                            <li className="flex gap-x-3">
                                <svg className="h-6 w-5 flex-none text-indigo-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                                </svg>
                                每月3000次API调用
                            </li>
                            <li className="flex gap-x-3">
                                <svg className="h-6 w-5 flex-none text-indigo-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                                </svg>
                                更高优先级模型访问
                            </li>
                            <li className="flex gap-x-3">
                                <svg className="h-6 w-5 flex-none text-indigo-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                                </svg>
                                高速响应（≤1秒）
                            </li>
                            <li className="flex gap-x-3">
                                <svg className="h-6 w-5 flex-none text-indigo-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                                </svg>
                                专属企业技术支持
                            </li>
                            <li className="flex gap-x-3">
                                <svg className="h-6 w-5 flex-none text-indigo-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                                </svg>
                                使用情况分析报告
                            </li>
                            <li className="flex gap-x-3">
                                <svg className="h-6 w-5 flex-none text-indigo-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                                </svg>
                                可自定义请求头信息
                            </li>
                        </ul>
                        <Suspense fallback={<div>Loading...</div>}>
                            <Paybtn price={18} />
                        </Suspense>
                    </div>
                </div>
            </div>
        </div>
    )
}
