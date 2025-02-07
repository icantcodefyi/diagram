import { signIn } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/texturebutton";
import Image from "next/image";


interface LoginDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginDialog({ isOpen, onClose }: LoginDialogProps) {
  const handleGoogleLogin = () => {
    void signIn("google", { callbackUrl: "/" });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            Get More Credits
          </DialogTitle>
          <DialogDescription className="text-center">
            Sign in to get 10 free credits daily and unlock unlimited diagram generation!
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center space-y-6 py-6">
          <div className="rounded-lg border bg-card p-6 text-card-foreground shadow">
            <div className="flex flex-col items-center space-y-2 text-center">
              <div className="rounded-full bg-primary/10 p-3">
                <svg
                  className="h-6 w-6 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold">Daily Credits</h3>
              <p className="text-sm text-muted-foreground">
                Get 10 free credits every day to generate beautiful diagrams
              </p>
            </div>
          </div>

          <Button
            className="w-full max-w-sm"
            onClick={handleGoogleLogin}
          >
            <Image
              src="/google.svg"
              alt="Google"
              width={20}
              height={20}
              className="mr-2"
            />
            Continue with Google
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
} 