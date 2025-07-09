"use client"

import React from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Lightbulb, Move, GitBranch, Eye } from "lucide-react"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Logo } from "./logo"

const presentationSlides = [
  {
    icon: Eye,
    title: "Intuitive Warehouse Visualization",
    description:
      "Get a bird's-eye view of your entire warehouse. Our interactive map uses a clear, color-coded system: green for empty cells, transitioning to dark red for high-volume storage. Instantly identify capacity issues and available space across multiple levels.",
    image: "https://placehold.co/1200x800",
    imageHint: "warehouse map",
  },
  {
    icon: Lightbulb,
    title: "Optimal Placement Algorithm",
    description:
      "Stop guessing where to store new products. Our system analyzes product volume and a configurable popularity score to suggest the most efficient placement. This deterministic algorithm ensures your most important items are always in the right place.",
    image: "https://placehold.co/1200x800",
    imageHint: "glowing lightbulb",
  },
  {
    icon: GitBranch,
    title: "Intelligent Chain Shifting",
    description:
      "Need to make space? The 'chain shifting' mechanism allows you to relocate a series of products with a single operation. Define the chain length, and our system will highlight the best empty spots, guiding you to the most efficient reorganization.",
    image: "https://placehold.co/1200x800",
    imageHint: "domino effect",
  },
    {
    icon: Move,
    title: "Responsive & Configurable",
    description:
      "Access your warehouse layout on any device, from desktop to mobile. Fine-tune the system to your needs by configuring the popularity score formula, volume color ranges, and chain shift defaults, all without needing any backend setup.",
    image: "https://placehold.co/1200x800",
    imageHint: "gears settings",
  },
]

export function Presentation() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-950">
        <div className="absolute top-4 left-4">
            <Button asChild variant="ghost">
                <Link href="/">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to App
                </Link>
            </Button>
        </div>
         <div className="absolute top-4 right-4">
            <Logo />
        </div>


      <Carousel className="w-full max-w-4xl">
        <CarouselContent>
          {presentationSlides.map((slide, index) => (
            <CarouselItem key={index}>
              <div className="p-1">
                <Card>
                  <CardContent className="grid md:grid-cols-2 gap-8 p-8 items-center">
                    <div className="space-y-4">
                      <div className="p-3 bg-primary/10 rounded-full w-fit">
                        <slide.icon className="h-8 w-8 text-primary" />
                      </div>
                      <h2 className="text-3xl font-bold font-headline">{slide.title}</h2>
                      <p className="text-muted-foreground">
                        {slide.description}
                      </p>
                    </div>
                    <div>
                      <Image
                        src={slide.image}
                        alt={slide.title}
                        width={600}
                        height={400}
                        className="rounded-lg object-cover shadow-lg"
                        data-ai-hint={slide.imageHint}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden sm:flex" />
        <CarouselNext className="hidden sm:flex" />
      </Carousel>
    </div>
  )
}
