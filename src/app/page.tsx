"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
} from "@clerk/nextjs";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">AI Habit Coach</CardTitle>
              <CardDescription>
                Build better habits with AI-powered coaching
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <SignedOut>
            <p className="text-sm text-muted-foreground mb-4">
              Sign in to start tracking your habits and get personalized AI coaching.
            </p>
            <div className="flex gap-2">
              <SignInButton mode="modal">
                <Button>Sign In</Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button variant="outline">Sign Up</Button>
              </SignUpButton>
            </div>
          </SignedOut>
          <SignedIn>
            <p className="text-sm text-muted-foreground mb-4">
              Welcome back! You&apos;re signed in and ready to build better habits.
            </p>
            <div className="flex gap-2">
              <Button asChild>
                <Link href="/dashboard">Go to Dashboard</Link>
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
          </SignedIn>
        </CardContent>
      </Card>
    </div>
  );
}
