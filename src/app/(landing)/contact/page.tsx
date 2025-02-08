import { Mail, Twitter, MessageCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
export default function Contact() {
  return (
    <div className="container mx-auto px-4 py-16 md:py-24">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-6">Contact Us</h2>
          <p className="text-muted-foreground mb-8">
            We&apos;re here to help and answer any question you might have. We look forward to
            hearing from you!
          </p>
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="bg-secondary/20 p-3 rounded-full">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <div>
                <Link href="mailto:venti.sillly@gmail.com">
                  <h3 className="font-semibold">Email</h3>
                  <p className="text-muted-foreground">venti.sillly@gmail.com</p>
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-secondary/20 p-3 rounded-full">
                <Twitter className="w-6 h-6 text-primary" />
              </div>
              <div>
                <Link href="https://x.com/icantcodefyi">
                  <h3 className="font-semibold">Twitter</h3>
                  <p className="text-muted-foreground">@icantcodefyi</p>
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-secondary/20 p-3 rounded-full">
                <MessageCircle className="w-6 h-6 text-primary" />
              </div>
              <div>
                  <h3 className="font-semibold">Discord</h3>
                  <p className="text-muted-foreground">@venti2</p>
              </div>
            </div>
          </div>
        </div>
        <div className="hidden md:block">
          <div className="bg-secondary/10 rounded-xl p-8 flex justify-center items-center">
            <Image
              src="/landing/contact.png"
              alt="Contact Us"
              width={400}
              height={400}
              className="rounded-lg"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
