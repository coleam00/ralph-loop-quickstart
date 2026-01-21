import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChatContainer } from "@/components/chat";

export default function CoachPage() {
  return (
    <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">AI Coach</h1>
        <p className="text-muted-foreground">
          Chat with your AI habit coach for personalized guidance.
        </p>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle>Chat</CardTitle>
          <CardDescription>
            Ask questions, get habit suggestions, or discuss your progress.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col overflow-hidden p-4 pt-0">
          <ChatContainer />
        </CardContent>
      </Card>
    </div>
  );
}
