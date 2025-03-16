import { SignOutButton } from "@clerk/nextjs";

// 直接使用预制按钮
export default function LogoutButton() {
    return (
        <SignOutButton redirectUrl="/">
            <button className="logout-btn">退出登录</button>
        </SignOutButton>
    );
}
