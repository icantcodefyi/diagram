import Link from "next/link";
import { Logo } from "@/components/landing/logo";

export function Footer() {
  return (
    <footer className="container mt-10 flex flex-wrap justify-between pb-16 pt-10 mt-20">
      <div className="flex basis-full justify-between gap-8 md:basis-auto md:flex-col md:justify-start">
        <Logo />
        <div className="flex items-center gap-5 ml-3">
          <a href="#" className="text-muted-foreground hover:text-foreground">
            <svg viewBox="0 0 438.549 438.549" className="size-5">
              <path
                d="M409.132 114.573c-19.608-33.596-46.205-60.194-79.798-79.8-33.598-19.607-70.277-29.408-110.063-29.408-39.781 0-76.472 9.804-110.063 29.408-33.596 19.605-60.192 46.204-79.8 79.8C9.803 148.168 0 184.854 0 224.63c0 47.78 13.94 90.745 41.827 128.906 27.884 38.164 63.906 64.572 108.063 79.227 5.14.954 8.945.283 11.419-1.996 2.475-2.282 3.711-5.14 3.711-8.562 0-.571-.049-5.708-.144-15.417a2549.81 2549.81 0 01-.144-25.406l-6.567 1.136c-4.187.767-9.469 1.092-15.846 1-6.374-.089-12.991-.757-19.842-1.999-6.854-1.231-13.229-4.086-19.13-8.559-5.898-4.473-10.085-10.328-12.56-17.556l-2.855-6.57c-1.903-4.374-4.899-9.233-8.992-14.559-4.093-5.331-8.232-8.945-12.419-10.848l-1.999-1.431c-1.332-.951-2.568-2.098-3.711-3.429-1.142-1.331-1.997-2.663-2.568-3.997-.572-1.335-.098-2.43 1.427-3.289 1.525-.859 4.281-1.276 8.28-1.276l5.708.853c3.807.763 8.516 3.042 14.133 6.851 5.614 3.806 10.229 8.754 13.846 14.842 4.38 7.806 9.657 13.754 15.846 17.847 6.184 4.093 12.419 6.136 18.699 6.136 6.28 0 11.704-.476 16.274-1.423 4.565-.952 8.848-2.383 12.847-4.285 1.713-12.758 6.377-22.559 13.988-29.41-10.848-1.14-20.601-2.857-29.264-5.14-8.658-2.286-17.605-5.996-26.835-11.14-9.235-5.137-16.896-11.516-22.985-19.126-6.09-7.614-11.088-17.61-14.987-29.979-3.901-12.374-5.852-26.648-5.852-42.826 0-23.035 7.52-42.637 22.557-58.817-7.044-17.318-6.379-36.732 1.997-58.24 5.52-1.715 13.706-.428 24.554 3.853 10.85 4.283 18.794 7.952 23.84 10.994 5.046 3.041 9.089 5.618 12.135 7.708 17.705-4.947 35.976-7.421 54.818-7.421s37.117 2.474 54.823 7.421l10.849-6.849c7.419-4.57 16.18-8.758 26.262-12.565 10.088-3.805 17.802-4.853 23.134-3.138 8.562 21.509 9.325 40.922 2.279 58.24 15.036 16.18 22.559 35.787 22.559 58.817 0 16.178-1.958 30.497-5.853 42.966-3.9 12.471-8.941 22.457-15.125 29.979-6.191 7.521-13.901 13.85-23.131 18.986-9.232 5.14-18.182 8.85-26.84 11.136-8.662 2.286-18.415 4.004-29.263 5.146 9.894 8.562 14.842 22.077 14.842 40.539v60.237c0 3.422 1.19 6.279 3.572 8.562 2.379 2.279 6.136 2.95 11.276 1.995 44.163-14.653 80.185-41.062 108.068-79.226 27.88-38.161 41.825-81.126 41.825-128.906-.01-39.771-9.818-76.454-29.414-110.049z"
                fill="currentColor"
              />
            </svg>
          </a>
          <a href="#" className="text-muted-foreground hover:text-foreground">
            <svg viewBox="0 0 248 204" className="size-5">
              <path
                d="M221.95 51.29c.15 2.17.15 4.34.15 6.53 0 66.73-50.8 143.69-143.69 143.69v-.04c-27.44.04-54.31-7.82-77.41-22.64 3.99.48 8 .72 12.02.73 22.74.02 44.83-7.61 62.72-21.66-21.61-.41-40.56-14.5-47.18-35.07 7.57 1.46 15.37 1.16 22.8-.87-23.56-4.76-40.51-25.46-40.51-49.5v-.64c7.02 3.91 14.88 6.08 22.92 6.32C11.58 63.31 4.74 33.79 18.14 10.71c25.64 31.55 63.47 50.73 104.08 52.76-4.07-17.54 1.49-35.92 14.61-48.25 20.34-19.12 52.33-18.14 71.45 2.19 11.31-2.23 22.15-6.38 32.07-12.26-3.77 11.69-11.66 21.62-22.2 27.93 10.01-1.18 19.79-3.86 29-7.95-6.78 10.16-15.32 19.01-25.2 26.16z"
                fill="currentColor"
              />
            </svg>
          </a>
          <a href="#" className="text-muted-foreground hover:text-foreground">
            <svg viewBox="0 0 28.57 20" className="size-5">
              <g>
                <path
                  d="M27.9727 3.12324C27.6435 1.89323 26.6768 0.926623 25.4468 0.597366C23.2197 2.24288e-07 14.285 0 14.285 0C14.285 0 5.35042 2.24288e-07 3.12323 0.597366C1.89323 0.926623 0.926623 1.89323 0.597366 3.12324C2.24288e-07 5.35042 0 10 0 10C0 10 2.24288e-07 14.6496 0.597366 16.8768C0.926623 18.1068 1.89323 19.0734 3.12323 19.4026C5.35042 20 14.285 20 14.285 20C14.285 20 23.2197 20 25.4468 19.4026C26.6768 19.0734 27.6435 18.1068 27.9727 16.8768C28.5701 14.6496 28.5701 10 28.5701 10C28.5701 10 28.5677 5.35042 27.9727 3.12324Z"
                  fill="currentColor"
                />
                <path
                  d="M11.4253 14.2854L18.8477 10.0004L11.4253 5.71533V14.2854Z"
                  fill="currentColor"
                  className="text-background"
                />
              </g>
            </svg>
          </a>
        </div>
      </div>
      <div className="mt-10 flex basis-1/2 flex-col gap-5 md:mt-0 md:basis-auto">
        <h3 className="font-semibold">Product</h3>
        <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
          Features
        </Link>
        <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
          Integrations
        </Link>
        <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
          Pricing
        </Link>
        <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
          Changelog
        </Link>
        <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
          Docs
        </Link>
        <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
          Download
        </Link>
      </div>
      <div className="mt-10 flex basis-1/2 flex-col gap-5 md:mt-0 md:basis-auto">
        <h3 className="font-semibold">Company</h3>
        <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
          About us
        </Link>
        <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
          Blog
        </Link>
        <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
          Careers
        </Link>
        <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
          Customers
        </Link>
        <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
          Brand
        </Link>
      </div>
      <div className="mt-10 flex basis-1/2 flex-col gap-5 md:mt-0 md:basis-auto">
        <h3 className="font-semibold">Resources</h3>
        <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
          Startup Program
        </Link>
        <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
          Community
        </Link>
        <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
          Contact
        </Link>
        <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
          DPA
        </Link>
        <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
          Privacy Policy
        </Link>
        <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
          Terms of service
        </Link>
      </div>
      <div className="mt-10 flex basis-1/2 flex-col gap-5 md:mt-0 md:basis-auto">
        <h3 className="font-semibold">Developers</h3>
        <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
          API
        </Link>
        <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
          Status
        </Link>
        <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
          GitHub
        </Link>
        <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
          Docs
        </Link>
      </div>
    </footer>
  );
}
