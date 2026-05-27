"use client";
import { signIn } from '@/lib/auth-client';
import { Loader2, Shield } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const GithubIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
)

const LoginUI = () => {
    const [isLoading, setIsLoading] = useState(false);

    const handleGithubLogin = async () => {
        if (isLoading) return;
        setIsLoading(true);
        try {
            await signIn.social({
                provider: "github",
                callbackURL: "/dashboard"
            });
        } catch (error) {
            console.error("Login error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-[#050505] text-white selection:bg-zinc-800">
            {/* Left Side Container */}
            <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 bg-[#050505] border-r border-zinc-900 leading-none">
                
                {/* Logo Section */}
                <div className="flex items-center gap-3 font-bold text-xl tracking-wide">
                    <div className="h-8 w-8 bg-[#F3E8D6] rounded-full flex items-center justify-center">
                        <Shield className="h-4 w-4 text-black" fill="currentColor" />
                    </div>
                    RepoShield
                </div>

                {/* Hero Text */}
                <div className="max-w-2xl mt-[-10vh]">
                    <h1 className="text-5xl lg:text-[4rem] font-bold leading-[1.1] mb-8 tracking-tight">
                        <span className="block">Cut Code Review</span>
                        <span className="block">Time & Bugs in Half.</span>
                        <span className="block">Instantly.</span>
                    </h1>
                    <p className="text-zinc-400 text-lg lg:text-[21px] max-w-md leading-relaxed tracking-wide">
                        Supercharge your team to ship faster with the most advanced AI code reviews.
                    </p>
                </div>

                {/* Empty bottom element just for spacing */}
                <div />
            </div>

            {/* Right Side Container */}
            <div className="flex flex-col justify-center items-center w-full lg:w-1/2 p-6 lg:p-12 relative">
                
                {/* Mobile Logo Fallback */}
                <div className="lg:hidden absolute top-8 left-8 flex items-center gap-3 font-bold text-xl tracking-wide">
                    <div className="h-8 w-8 bg-[#F3E8D6] rounded-full flex items-center justify-center">
                        <Shield className="h-4 w-4 text-black" fill="currentColor" />
                    </div>
                    RepoShield
                </div>

                <div className="w-full max-w-[400px]">
                    {/* Header */}
                    <div className="space-y-4 mb-10">
                        <h2 className="text-[2rem] font-bold tracking-wide">Welcome Back</h2>
                        <p className="text-[16px] text-zinc-400 tracking-wide mt-2">
                            Login using the following providers:
                        </p>
                    </div>

                    {/* Login Button */}
                    <div className="mb-10">
                        <Button 
                            onClick={handleGithubLogin}
                            disabled={isLoading}
                            variant="default"
                            className="w-full h-[52px] bg-white text-black hover:bg-zinc-200 transition-colors font-medium rounded-md flex items-center justify-center gap-3 text-[16px]"
                        >
                            {isLoading ? (
                                <Loader2 className="h-5 w-5 animate-spin text-black" />
                            ) : (
                                <GithubIcon className="h-[22px] w-[22px]" />
                            )}
                            GitHub
                        </Button>
                    </div>

                    {/* Extra Links */}
                    <div className="flex flex-col items-center gap-4 text-[14px]">
                        <p className="text-zinc-400 tracking-wide">
                            New to RepoShield? <a href="#" className="font-semibold text-[#F3E8D6] hover:text-white transition-colors duration-200 ml-1">Sign Up</a>
                        </p>
                        <a href="#" className="font-semibold text-[#F3E8D6] hover:text-white transition-colors duration-200 tracking-wide">
                            Self-Hosted Services
                        </a>
                    </div>
                    
                    {/* Divider & Footer Links */}
                    <div className="mt-14 pt-8 border-t border-zinc-800/80">
                        <div className="flex items-center justify-center gap-3 text-[13px] text-zinc-500 tracking-wide">
                            <a href="#" className="hover:text-zinc-300 transition-colors">Terms of Use</a>
                            <span>and</span>
                            <a href="#" className="hover:text-zinc-300 transition-colors">Privacy Policy</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LoginUI;