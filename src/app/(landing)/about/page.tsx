import { Sparkles, Code, Share2, CheckCircle } from "lucide-react";
import Image from "next/image";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { DIAGRAM_TYPES } from "@/constants/diagram-types";
import { DiagramTypesSlider } from "@/components/diagram-types-slider";

export default function Section() {
  return (
    <>
      <section className="relative py-24">
        <div className="container px-4 md:px-6">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div className="space-y-6">
              <h2 className="font-heading text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Transform Code into Beautiful Diagrams
              </h2>
              <p className="text-lg text-muted-foreground">
                Diagramify is your AI-powered companion for converting code into
                clear, elegant diagrams. Whether you&apos;re documenting
                architecture, explaining workflows, or visualizing data
                structures, we make it simple and beautiful.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold">
                      AI-Powered Generation
                    </h3>
                    <p className="text-muted-foreground">
                      Intelligent conversion of code to diagrams in seconds
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Code className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold">
                      Multiple Formats
                    </h3>
                    <p className="text-muted-foreground">
                      Support for sequence, flow, class, and more diagrams
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Share2 className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold">Easy Sharing</h3>
                    <p className="text-muted-foreground">
                      Export and share diagrams in various formats
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <video
                autoPlay
                muted
                loop
                playsInline
                className="rounded-xl object-cover"
              >
                <source src="/video.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              <div className="absolute -bottom-6 -left-6 hidden lg:block">
                <div className="rounded-lg bg-background p-6 shadow-lg">
                  <div className="flex items-center gap-4">
                    <div className="flex -space-x-4">
                      <Avatar className="border-2 border-background">
                        <AvatarImage
                          alt="Sequence diagram"
                          src="/images/sequence-diagram.png"
                        />
                        <AvatarFallback>SD</AvatarFallback>
                      </Avatar>
                      <Avatar className="border-2 border-background">
                        <AvatarImage
                          alt="Flow diagram"
                          src="/images/flow-diagram.png"
                        />
                        <AvatarFallback>FD</AvatarFallback>
                      </Avatar>
                      <Avatar className="border-2 border-background">
                        <AvatarImage
                          alt="Class diagram"
                          src="/images/class-diagram.png"
                        />
                        <AvatarFallback>CD</AvatarFallback>
                      </Avatar>
                    </div>
                    <div>
                      <p className="font-heading font-semibold">
                        Multiple Diagrams
                      </p>
                      <p className="text-sm text-muted-foreground">One Tool</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="px-4 py-16 md:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 font-heading text-3xl font-bold md:text-4xl">
              Comprehensive Diagram Support for College
            </h2>
            <p className="text-lg text-muted-foreground">
              We support a wide range of professional diagrams to meet all your
              academic needs
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="transition-shadow hover:shadow-lg">
              <CardHeader>
                <CardTitle>Software Engineering</CardTitle>
                <CardDescription>UML and Development Diagrams</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Class Diagrams
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Sequence Diagrams
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    State Diagrams
                  </li>
                </ul>
              </CardContent>
            </Card>
            <Card className="transition-shadow hover:shadow-lg">
              <CardHeader>
                <CardTitle>Project Management</CardTitle>
                <CardDescription>
                  Planning and Organization Tools
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Gantt Charts
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Kanban Boards
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Journey Maps
                  </li>
                </ul>
              </CardContent>
            </Card>
            <Card className="transition-shadow hover:shadow-lg">
              <CardHeader>
                <CardTitle>Database Design</CardTitle>
                <CardDescription>Data Modeling Solutions</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    ER Diagrams
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Flow Charts
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    C4 Models
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
          <div className="mt-12 rounded-lg border bg-card p-4 sm:p-6 md:p-8">
            <div className="grid grid-cols-1 items-center gap-4 lg:grid-cols-2 lg:gap-8">
              <div className="space-y-3 sm:space-y-4">
                <h3 className="font-heading text-2xl font-semibold sm:text-3xl">
                  Additional Types of Diagrams
                </h3>
                <p className="text-base text-muted-foreground sm:text-lg">
                  Explore our diverse collection of diagram types, each designed
                  to help you visualize different aspects of your projects
                  effectively.
                </p>
              </div>
              <div className="mx-auto w-full max-w-sm sm:max-w-md">
                <DiagramTypesSlider diagrams={DIAGRAM_TYPES} />
              </div>
            </div>
          </div>
          <div className="mt-12 text-center">
            <Button variant="default" size="lg" className="gap-2">
              <PlusCircle className="h-4 w-4" />
              Start Creating Diagrams
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}

import { Sparkles, Code, Share2, CheckCircle } from "lucide-react";
import Image from "next/image";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { DIAGRAM_TYPES } from "@/constants/diagram-types";
import { DiagramTypesSlider } from "@/components/diagram-types-slider";

export default function Section() {
  return (
    <>
      <section className="relative py-24">
        <div className="container px-4 md:px-6">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div className="space-y-6">
              <h2 className="font-heading text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Transform Code into Beautiful Diagrams
              </h2>
              <p className="text-lg text-muted-foreground">
                Diagramify is your AI-powered companion for converting code into
                clear, elegant diagrams. Whether you&apos;re documenting
                architecture, explaining workflows, or visualizing data
                structures, we make it simple and beautiful.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold">
                      AI-Powered Generation
                    </h3>
                    <p className="text-muted-foreground">
                      Intelligent conversion of code to diagrams in seconds
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Code className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold">
                      Multiple Formats
                    </h3>
                    <p className="text-muted-foreground">
                      Support for sequence, flow, class, and more diagrams
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Share2 className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold">Easy Sharing</h3>
                    <p className="text-muted-foreground">
                      Export and share diagrams in various formats
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <video
                autoPlay
                muted
                loop
                playsInline
                className="rounded-xl object-cover"
              >
                <source src="/video.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              <div className="absolute -bottom-6 -left-6 hidden lg:block">
                <div className="rounded-lg bg-background p-6 shadow-lg">
                  <div className="flex items-center gap-4">
                    <div className="flex -space-x-4">
                      <Avatar className="border-2 border-background">
                        <AvatarImage
                          alt="Sequence diagram"
                          src="/images/sequence-diagram.png"
                        />
                        <AvatarFallback>SD</AvatarFallback>
                      </Avatar>
                      <Avatar className="border-2 border-background">
                        <AvatarImage
                          alt="Flow diagram"
                          src="/images/flow-diagram.png"
                        />
                        <AvatarFallback>FD</AvatarFallback>
                      </Avatar>
                      <Avatar className="border-2 border-background">
                        <AvatarImage
                          alt="Class diagram"
                          src="/images/class-diagram.png"
                        />
                        <AvatarFallback>CD</AvatarFallback>
                      </Avatar>
                    </div>
                    <div>
                      <p className="font-heading font-semibold">
                        Multiple Diagrams
                      </p>
                      <p className="text-sm text-muted-foreground">One Tool</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="px-4 py-16 md:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 font-heading text-3xl font-bold md:text-4xl">
              Comprehensive Diagram Support for College
            </h2>
            <p className="text-lg text-muted-foreground">
              We support a wide range of professional diagrams to meet all your
              academic needs
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="transition-shadow hover:shadow-lg">
              <CardHeader>
                <CardTitle>Software Engineering</CardTitle>
                <CardDescription>UML and Development Diagrams</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Class Diagrams
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Sequence Diagrams
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    State Diagrams
                  </li>
                </ul>
              </CardContent>
            </Card>
            <Card className="transition-shadow hover:shadow-lg">
              <CardHeader>
                <CardTitle>Project Management</CardTitle>
                <CardDescription>
                  Planning and Organization Tools
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Gantt Charts
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Kanban Boards
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Journey Maps
                  </li>
                </ul>
              </CardContent>
            </Card>
            <Card className="transition-shadow hover:shadow-lg">
              <CardHeader>
                <CardTitle>Database Design</CardTitle>
                <CardDescription>Data Modeling Solutions</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    ER Diagrams
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    Flow Charts
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    C4 Models
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
          <div className="mt-12 rounded-lg border bg-card p-4 sm:p-6 md:p-8">
            <div className="grid grid-cols-1 items-center gap-4 lg:grid-cols-2 lg:gap-8">
              <div className="space-y-3 sm:space-y-4">
                <h3 className="font-heading text-2xl font-semibold sm:text-3xl">
                  Additional Types of Diagrams
                </h3>
                <p className="text-base text-muted-foreground sm:text-lg">
                  Explore our diverse collection of diagram types, each designed
                  to help you visualize different aspects of your projects
                  effectively.
                </p>
              </div>
              <div className="mx-auto w-full max-w-sm sm:max-w-md">
                <DiagramTypesSlider diagrams={DIAGRAM_TYPES} />
              </div>
            </div>
          </div>
          <div className="mt-12 text-center">
            <Button variant="default" size="lg" className="gap-2">
              <PlusCircle className="h-4 w-4" />
              Start Creating Diagrams
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
