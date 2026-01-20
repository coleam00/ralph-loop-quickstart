"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">AI Habit Coach</CardTitle>
          <CardDescription>
            Build better habits with AI-powered coaching
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input placeholder="Enter your first habit..." />
          <div className="flex gap-2">
            <Button
              onClick={() => toast.success("Welcome to AI Habit Coach!")}
            >
              Get Started
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Learn More</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>About AI Habit Coach</DialogTitle>
                  <DialogDescription>
                    AI Habit Coach helps you build and maintain healthy habits
                    with personalized AI-powered coaching, streak tracking, and
                    goal setting.
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
