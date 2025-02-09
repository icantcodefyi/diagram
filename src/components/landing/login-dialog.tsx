"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/texturebutton";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { GiftIcon, UnlockIcon, SaveIcon } from "lucide-react";
import { useState } from "react";

interface LoginDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginDialog({ isOpen, onClose }: LoginDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = () => {
    setIsLoading(true);
    void signIn("google", { callbackUrl: "/pricing" });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Login Required</DialogTitle>
          <DialogDescription>
            Please log in to subscribe and unlock exclusive benefits
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center space-x-3 rounded-lg border p-3 transition-colors hover:bg-muted/50">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <GiftIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium">Free Credits</p>
              <p className="text-xs text-muted-foreground">
                Get 20 free credits instantly upon login
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 rounded-lg border p-3 transition-colors hover:bg-muted/50">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <UnlockIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium">Premium Features</p>
              <p className="text-xs text-muted-foreground">
                Unlock exclusive premium features and capabilities
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 rounded-lg border p-3 transition-colors hover:bg-muted/50">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <SaveIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium">Save Progress</p>
              <p className="text-xs text-muted-foreground">
                Your preferences and history are automatically saved
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button 
            className="w-full max-w-sm" 
            onClick={handleGoogleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-white" />
            ) : (
              <Image
                src="/google.svg"
                alt="Google"
                width={20}
                height={20}
                className="mr-2"
              />
            )}
            {isLoading ? "Redirecting..." : "Continue with Google"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
